import { createError } from "../errors/errors.js";
import JwtUtils from "../security/JwtUtils.js";
import accountingService from "../service/AccountsService.js";

const BEARER = "Bearer ";
const BASIC = "Basic ";
export function authenticate() {
  return async (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (authHeader) {
      if (authHeader.startsWith(BEARER)) {
        jwtAuthentication(req, authHeader);
      } else if (authHeader.startsWith(BASIC)) {
        await basicAuthentication(req, authHeader);
      }
    }

    next();
  };
}
function jwtAuthentication(req, authHeader) {
  const token = authHeader.substring(BEARER.length);
  try {
    const payload = JwtUtils.verifyJwt(token);
    req.user = payload.sub;
    req.role = payload.role;
    req.authType = "jwt";
  } catch (error) {}
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
     await accountingService.checkLogin(serviceAccount, userNamePasswordArr[1]);
      req.user = userNamePasswordArr[0];
      req.role = serviceAccount.role;
      req.authType = "basic";
    }
  } catch (error) {}
}
export function auth(paths) {
  return (req, res, next) => {
    const { authentication, authorization } = paths[req.method];
    if (!authorization) {
      throw createError(500, "security configuration not provided");
    }
    if (authentication(req)) {
      if (req.authType !== authentication(req)) {
        throw createError(401, "no required authentication");
      }
      if (!authorization(req)) {
        throw createError(403, "");
      }
    }
    next();
  };
}