import jwt from "jsonwebtoken";
import { getExpirationIn } from "../service/AccountsService.js";
export default class JwtUtils {
  static getJwt(serviceAccount) {
    return jwt.sign({ role: serviceAccount.role, email: serviceAccount._id }, process.env.JWT_SECRET, {
      subject: serviceAccount.username,
      expiresIn: getExpirationIn() + "",
    });
  }
  static verifyJwt(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}