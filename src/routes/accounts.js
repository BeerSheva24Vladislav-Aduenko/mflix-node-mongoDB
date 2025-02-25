import express from "express";
import asyncHandler from "express-async-handler";
import { validator } from "../middleware/validation.js";
import { schemaAccount, schemaGetAccount } from "../validation/userSchemas.js";
import accountingService from "../service/AccountsService.js";
import { authenticate, auth } from "../middleware/auth.js";
import accountingPathes from "../paths/accountingPathes.js";

const accountsRoute = express.Router();
accountsRoute.use(auth(accountingPathes));


// add admin account
accountsRoute.post("/admin", validator(schemaAccount), asyncHandler(async (req, res) => {
  await accountingService.addAdminAccount(req.body);
  res.status(201).send("account added");
}));

//add user account
accountsRoute.post("/user", validator(schemaAccount), asyncHandler(async (req, res) => {
  await accountingService.addUserAccount(req.body);
  res.status(201).send("account added");
}));

// update account
accountsRoute.put("/", validator(schemaAccount), asyncHandler(async (req, res) => {
  await accountingService.updateAccount(req.body);
  res.send("account updated");
}));
// accountsRoute.get("/", validator(schemaGetAccount), (req, res) => {
//   const account = accountingService.getAccount(req.body.email);
//   res.send(account);
// });
accountsRoute.post(
  "/login",
  asyncHandler(async (req, res) => {
    const token = await accountingService.login(req.body);
    res.send(token);
  })
);
accountsRoute.delete("/", validator(schemaGetAccount), (req, res) => {
  accountingService.delete(req.body.email);
  res.send("deleted");
});
export default accountsRoute;
