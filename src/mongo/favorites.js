import MongoConnection from "../MongoConnection.js";
import { ObjectId } from "mongodb";
import { createError } from "../errors/errors.js";
const {
  MONGO_CONNECTION,
  MONGO_PASSWORD,
  MONGO_CLUSTER,
  DB_NAME,
  MONGO_FAVORITE,
} = process.env;

const connectionStr = `${MONGO_CONNECTION}:${MONGO_PASSWORD}@${MONGO_CLUSTER}`;
const mongoConnection = new MongoConnection(connectionStr, DB_NAME);
const favoriteCollection = mongoConnection.getCollection(MONGO_FAVORITE);
export async function addFavoriteMongo(favorite) {
  try {
    const result = await favoriteCollection.insertOne(favorite);
    return result;
  } catch (error) {
    throw error;
  }
}
export async function isUserExists(email) {
  try {
    const user = await usersCollection.findOne({ _id: email });
    return user;
  } catch (error) {
    throw error;
  }
}

export async function existingFavorite(email, movie_id) {
  try {
    const favorite = await favoriteCollection.findOne({
      email,
      movie_id: new ObjectId(movie_id),
    });
    return favorite;
  } catch (error) {
    throw createError(500, "Error checking favorite movie");
  }
}

export async function getFavoritesByEmail(email) {
  try {
    const favorites = await favoriteCollection.find({ email }).toArray();
    return favorites;
  } catch (error) {
    throw error;
  }
}

export async function updatedFavoriteMongo(updateFields, favoriteId, email) {
  try {
    const updatedFavorite = await favoriteCollection.findOneAndUpdate(
      { _id: new ObjectId(favoriteId), email },
      { $set: updateFields },
      { returnDocument: "after" }
    );
    return updatedFavorite;
  } catch (error) {
    throw error;
  }
}

export async function deleteFavoriteMongo(favoriteId, email) {
  try {
    const deletedFavorite = await favoriteCollection.findOneAndDelete({
      _id: new ObjectId(favoriteId),
      email,
    });
    return deletedFavorite;
  } catch (error) {
    throw error;
  }
}
