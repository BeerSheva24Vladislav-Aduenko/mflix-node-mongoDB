import MongoConnection from "../MongoConnection.js";
import { createError } from "../errors/errors.js";
const {
  MONGO_CONNECTION,
  MONGO_PASSWORD,
  MONGO_CLUSTER,
  DB_NAME,
  MONGO_USERS,
} = process.env;

const connectionStr = `${MONGO_CONNECTION}:${MONGO_PASSWORD}@${MONGO_CLUSTER}`;
const mongoConnection = new MongoConnection(connectionStr, DB_NAME);
const usersCollection = mongoConnection.getCollection(MONGO_USERS);
export async function addUser(account) {
  try {
    await usersCollection.insertOne(account);
    console.log(`User ${account.username} has been added`);
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
}
export async function isUserExists(email) {
  const user = await usersCollection.findOne({ _id: email });
  if (user) {
    throw createError(409, `account with email: ${email} already exists`);
  }
}

