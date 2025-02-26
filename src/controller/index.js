import express from "express";
import { authenticate } from "../middleware/auth.js";
import { errorHandler } from "../errors/errors.js";
import { logger } from "../logger/logger.js";
import accountsRoute from "../routes/accounts.js";
import favoritesRoute from "../routes/favorites.js";


const app = express();
const port = process.env.PORT || 3500;

app.use(express.json());
app.use(logger);

app.use(authenticate());

app.use("/accounts", accountsRoute);
app.use("/favorites", favoritesRoute);

app.use((req, res) => {
  res.status(404).send(`path ${req.path} is not found`);
});
app.listen(port, () => console.log(`server is listening on port ${port}`));
app.use(errorHandler);
