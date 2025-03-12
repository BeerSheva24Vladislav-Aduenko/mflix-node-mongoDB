import config from "config";
import bcrypt from "bcrypt";
import { createError } from "../errors/errors.js";
import mongoConnection from "../db/MongoConnection.js";
import JwtUtils from "../security/JwtUtils.js";

const userRole = config.get("accounting.user_role");
const adminRole = config.get("accounting.admin_role");
const time_units = {
  h: 3600 * 1000,
  d: 3600 * 1000 * 24,
  m: 60 * 1000,
  s: 1000,
  ms: 1,
};

class AccountsService {
  #accounts;
  constructor() {
    this.#accounts = mongoConnection.getCollection(
      config.get("db.accounts_collection")
    );
  }

  async addAdminAccount(account) {
    await this.#addAccount(account, adminRole);
    return await this.getAccount(account.email);
  }

  async addAccount(account) {
    await this.#addAccount(account, userRole);
    return await this.getAccount(account.email);
  }

  async #addAccount(account, role) {
    const checkExists = await this.#accounts.findOne({ _id: account.email });
    if (checkExists) {
      throw createError(
        409,
        `account with email: ${account.email} already exists`
      );
    }
    const serviceAccount = await this.#toServiceAccount(account, role);
    await this.#accounts.insertOne(serviceAccount);
  }

  async #toServiceAccount(account, role) {
    try {
      const hashPassword = await bcrypt.hash(
        account.password,
        config.get("accounting.salt_rounds")
      );
      const expiration = getExpiration();
      const serviceAccount = {
        _id: account.email,
        username: account.username,
        role,
        hashPassword,
        expiration,
        blocked: false,
        requestCount: 0, 
        lastResetTime: null,
      };
      return serviceAccount;
    } catch (error) {
      console.error("Error hashing password:", error);
      throw error;
    }
  }

  async getAccount(email) {
    const checkExists = await this.#accounts.findOne({ _id: email });    
    if (!checkExists) {
      throw createError(404, `account with email: ${email} doesn’t exist`);
    }
    return checkExists;
  }

  async updateAccount(email, updateData) {
    const result = await this.#accounts.findOneAndUpdate(
      { _id: email },
      { $set: updateData },
      { returnDocument: "after", upsert: true } // Создаёт аккаунт, если его нет
    );
    return result.value;
  }

  async updatePassword(account) {
    const checkExists = await this.getAccount(account.email);
    const newHashPassword = await this.#updatePassword(
      checkExists,
      account.password
    );
    const accWithNewPassword = await this.#accounts.findOneAndUpdate(
      { _id: checkExists._id },
      { $set: { newHashPassword } },
      { returnDocument: "after" }
    );
    if (!accWithNewPassword) {
      throw createError(400, `The password hasn't been changed`);
    }
  }

  async #updatePassword(account, newPassword) {
    if (bcrypt.compareSync(newPassword, account.hashPassword)) {
      throw createError(
        400,
        `New password should be different from the existing one`
      );
    }
    const newHashPassword = bcrypt.hashSync(
      newPassword,
      config.get("accounting.salt_rounds")
    );
    return newHashPassword;
  }

  async checkLogin(serviceAccount, password) {
    if (
      !serviceAccount ||
      !(await bcrypt.compare(password, serviceAccount.hashPassword))
    ) {
      throw createError(400, "Wrong credentials");
    }
    if (new Date().getTime() > serviceAccount.expiration) {
      throw createError(400, "Account's password is expired");
    }
  }

  async changeRole({ email, role }) {
    const setRole = await this.#accounts.findOneAndUpdate(
      { _id: email },
      { $set: { role } },
      { returnDocument: "after" }
    );
    if (!setRole) {
      throw createError(404, `account with email: ${email} doesn’t exist`);
    }
    return setRole;
  }

  async setAccountBlockStatus(email, blockStatus) {
    const checkExists = await this.#accounts.findOne({ _id: email });
    if (!checkExists) {
      throw createError(404, `account with email: ${email} doesn’t exist`);
    }
    const blockStatusRes = await this.#accounts.updateOne(
      { _id: email },
      { $set: { blocked: blockStatus } }
    );
    return blockStatusRes;
  }

  async delete(email) {
    await this.getAccount(email);
    const deletedAccount = await this.#accounts.deleteOne({ _id: email });
    return deletedAccount;
  }

  async login(account) {
    try {
      const { email, password } = account;
      const user = await this.getAccount(email);
      if (user.blocked) {
        throw createError(400, "account is blocked");
      }
      await this.checkLogin(user, password);
      return JwtUtils.getJwt(user);
    } catch (error) {
      throw error;
    }
  }
}
function getExpiration() {
  const expiredIn = getExpirationIn();
  return new Date().getTime() + expiredIn;
}
const accountingService = new AccountsService();
export default accountingService;
export function getExpirationIn() {
  const expiredInStr = config.get("accounting.expiredIn");
  const amount = expiredInStr.split(/\D/)[0];
  const parseArray = expiredInStr.split(/\d/);
  const index = parseArray.findIndex((e) => !!e.trim());
  const unit = parseArray[index];
  const unitValue = time_units[unit];
  if (!unitValue) {
    throw createError(500, `Wrong configuration: unit ${unit} doesn't exist`);
  }
  return amount * unitValue;
}
