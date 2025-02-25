import express from "express";
import { authenticate } from "../middleware/auth.js";
import { errorHandler } from "../errors/errors.js";
import { logger } from "../logger/logger.js";
import accountsRoute from "../routes/accounts.js";
import MongoConnection from "../MongoConnection.js";
const {
  MONGO_CONNECTION,
  MONGO_PASSWORD,
  MONGO_CLUSTER,
  DB_NAME,
  MOVIES_COLLECTION,
  COMMENTS_COLLECTION,
} = process.env;

const connectionString = `${MONGO_CONNECTION}:${MONGO_PASSWORD}@${MONGO_CLUSTER}`;
const mongoConnection = new MongoConnection(connectionString, DB_NAME);

const app = express();
const port = process.env.PORT || 3500;

app.use(express.json());
app.use(logger);

app.use(authenticate());

app.use("/accounts", accountsRoute);
app.use((req, res) => {
  res.status(404).send(`path ${req.path} is not found`);
});
app.listen(port, () => console.log(`server is listening on port ${port}`));
app.use(errorHandler);



// const moviesCollection = mongoConnection.getCollection(MOVIES_COLLECTION);
// const commentsCollection = mongoConnection.getCollection(COMMENTS_COLLECTION);

// await mongoConnection.connect();
// async function runQuery(filter, aggregation = false) {
//   try {
//     let result;
//     if (aggregation) {
//       if (!Array.isArray(filter)) {
//         throw new Error("Your query is not array");
//       }
//       result = await moviesCollection.aggregate(filter).toArray();
//     } else {
//       result = await moviesCollection.find(filter).toArray();
//     }
//     console.log(result);
//   } catch (error) {
//     console.error("Error: ", error);
//   }
// }

// await runQuery({ languages: "Russian" });

// await mongoConnection.close();