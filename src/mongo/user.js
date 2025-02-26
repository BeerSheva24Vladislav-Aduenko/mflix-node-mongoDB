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
  return user;
}

export async function changeRoleDB(email, role) {
  try {
    const newRole = await usersCollection.findOneAndUpdate(
      { _id: email },
      { $set: { role } },
      { returnDocument: "after" }
    );    
    return newRole;
  } catch (error) {
    throw error;
  }
}

export async function saveNewPassword(email, hashPassword) {  
  try {
    const newPassword = await usersCollection.findOneAndUpdate(
      { _id: email },
      { $set: { hashPassword } },
      { returnDocument: "after" }
    );
    return newPassword;
  } catch (error) {
    throw error;
  }
}


export async function setAccountBlockStatusDB(email, blockStatus) {  
  try {
    const blockStatusRes = await usersCollection.updateOne(
      { _id: email },
      { $set: { blocked: blockStatus } },

    );
    return blockStatusRes;
  } catch (error) {
    throw error;
  }
}

export async function deleteAccountDB(email) {
  try {
    const deletedAccount = await usersCollection.deleteOne({ _id: email });
    return deletedAccount;
  } catch (error) {
    throw error;
  }
}