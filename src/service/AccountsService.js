import config from "config";
import bcrypt from "bcrypt";
import { createError } from "../errors/errors.js";
import { addUser, isUserExists } from "../mongo/user.js";
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
  async addAdminAccount(account) {
    await this.#addAccount(account, account.role ?? adminRole);
  }

  async addUserAccount(account) {
    await this.#addAccount(account, account.role ?? userRole);
  }

  async #addAccount(account, role) {
    const checkExists = await isUserExists(account.email);
    if (checkExists) {
      throw createError(
        409,
        `account with email: ${account.email} already exists`
      );
    }
    const serviceAccount = await this.#toServiceAccount(account, role);
    await addUser(serviceAccount);
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
      };
      return serviceAccount;
    } catch (error) {
      console.error("Error hashing password:", error);
      throw error;
    }
  }
  updateAccount(account) {
    const serviceAccount = this.getAccount(account.email);
    this.#updatePassword(serviceAccount, account.password);
  }

  async login(account) {
    try {
      const { email, password } = account;
      const user = await isUserExists(email);
      if (!user) {
        throw createError(
          401,
          `account with email: ${email} doesn't exists`
        );
      }
      await this.checkLogin(user, password);
      return JwtUtils.getJwt(user);
    } catch (error) {
      throw error;
    }
  }

  // getAccount(username) {
  //   const serviceAccount = this.#accounts[username];
  //   if (!serviceAccount) {
  //     throw createError(404, `account ${username} doesn't exist`);
  //   }
  //   return serviceAccount;
  // }

  // async delete(username) {
  //   try {
  //     this.getAccount(username);
  //     delete this.#accounts[username];
  //   } catch (error) {
  //     console.error("Error deleting account:", error);
  //     throw error;
  //   }
  // }

  #updatePassword(serviceAccount, newPassword) {
    if (bcrypt.compareSync(newPassword, serviceAccount.hashPassword)) {
      throw createError(
        400,
        `new password should be different from the existing one`
      );
    }
    serviceAccount.hashPassword = bcrypt.hashSync(
      newPassword,
      config.get("accounting.salt_rounds")
    );
    serviceAccount.expiration = getExpiration();
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
