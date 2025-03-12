import { createError } from "../errors/errors.js";
import JwtUtils from "../security/JwtUtils.js";
import accountingService from "../service/AccountsService.js";

const BEARER = "Bearer ";
const BASIC = "Basic ";
export function authenticate(paths) {
  return async (req, res, next) => {
    try {
      const authHeader = req.header("Authorization");
      if (authHeader) {
        if (authHeader.startsWith(BEARER)) {
          await jwtAuthentication(req, authHeader);
        } else if (authHeader.startsWith(BASIC)) {
          await basicAuthentication(req, authHeader);
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
async function jwtAuthentication(req, authHeader) {
  const token = authHeader.substring(BEARER.length);
  try {
    const payload = JwtUtils.verifyJwt(token);
    req.user = payload.email;
    req.role = payload.role;
    req.authType = "JWT";
  } catch (error) {
    throw createError(401, "Token isn't valid");
  }
}
async function basicAuthentication(req, authHeader) {
  const userNamePassword64 = authHeader.substring(BASIC.length); //username:password
  const userNamePassword = Buffer.from(userNamePassword64, "base64").toString(
    "utf-8"
  );
  const userNamePasswordArr = userNamePassword.split(":");

  try {
    if (userNamePasswordArr[0] === process.env.ADMIN_USERNAME) {
      if (userNamePasswordArr[1] === process.env.ADMIN_PASSWORD) {
        req.user = process.env.ADMIN_USERNAME;
        req.role = "";
        req.authType = "basic";
      }
    } else {
      const serviceAccount = accountingService.getAccount(
        userNamePasswordArr[0]
      );
      await accountingService.checkLogin(
        serviceAccount,
        userNamePasswordArr[1]
      );
      req.user = userNamePasswordArr[0];
      req.role = serviceAccount.role;
      req.authType = "basic";
    }
  } catch (error) {
    throw createError(401, "wrong credentials");
  }
}
export function auth(paths) {
  return async (req, res, next) => {
    try {
      const { authentication, authorization } = paths[req.method];
      if (!authorization) {
        throw createError(500, "Security configuration not provided");
      }
      if (authentication(req)) {
        if (req.authType !== authentication(req)) {
          throw createError(401, "No required authentication");
        }
        if (!(await authorization(req))) {
          throw createError(403, "Access denied");
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
