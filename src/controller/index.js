import express from "express";
import { authenticate } from "../middleware/auth.js";
import { errorHandler } from "../errors/errors.js";
import accountsRoute from "../routes/accounts.js";
import favoritesRoute from "../routes/favorites.js";
import moviesRoute from "../routes/movies.js";
import commentsRoute from "../routes/comments.js";
import {
  morganErrorLogger,
  morganAccessLogger,
} from "../logger/morganLogging.js";
import  logger  from "../logger/winstonLogging.js";

const app = express();
const port = process.env.PORT || 3500;

app.use(express.json());

app.use(morganAccessLogger);
app.use(morganErrorLogger);

app.use(authenticate());

app.use("/accounts", accountsRoute);
app.use("/favorites", favoritesRoute);
app.use("/movies", moviesRoute);
app.use("/comments", commentsRoute);

app.use((req, res) => {
  res.status(404).send(`path ${req.path} is not found`);
});
app.listen(port, () =>
  logger.info(`server is listening on port ${port}`)
);
app.use(errorHandler);
