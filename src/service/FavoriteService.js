import { ObjectId } from "mongodb";
import { createError } from "../errors/errors.js";
import mongoConnection from "../db/MongoConnection.js";
import accountsService from "./AccountsService.js";
import config from "config";

class FavoritesService {
  #favorites;
  constructor() {
    this.#favorites = mongoConnection.getCollection(
      config.get("db.favorites_collection")
    );
  }
  async addFavorite({ email, movie_id, feed_back, viewed }) {
    await accountsService.getAccount(email);
    const favoriteExists = await this.#favorites.findOne({
      email,
      movie_id: ObjectId.createFromHexString(movie_id),
    });
    if (favoriteExists) {
      throw createError(409, "This movie is already in favorites");
    }

    const favorite = {
      _id: new ObjectId(),
      email,
      movie_id: ObjectId.createFromHexString(movie_id),
      feed_back: feed_back || null,
      viewed: viewed ?? false,
    };
    await this.#favorites.insertOne(favorite);

    return favorite;
  }

  async getUserFavoriteMovies(email) {
    const userExists = await accountsService.getAccount(email);
    if (!userExists) {
      throw createError(
        409,
        `Account with email: ${account.email} doesn't exists`
      );
    }
    const favorites = await this.#favorites.find({ email }).toArray();
    return favorites;
  }

  async updateFavorite({ favoriteId, viewed, feed_back, email, }) {
    const updatedFavorite = await this.#favorites.findOneAndUpdate(
      { _id: ObjectId.createFromHexString(favoriteId), email },
      { $set: { viewed, feed_back, feed_back } },
      { returnDocument: "after" }
    );
    if (!updatedFavorite) {
      throw createError(404, "Favorite doesn't exist");
    }
    return updatedFavorite;
  }

  async deleteFavorite({ favoriteId, email }) {
    const deletedFavorite = await this.#favorites.findOneAndDelete({
      _id: ObjectId.createFromHexString(favoriteId),
      email,
    });

    if (!deletedFavorite) {
      throw createError(404, "Favorite doesn't exist");
    }
    return deletedFavorite;
  }
}

const favoritesService = new FavoritesService();
export default favoritesService;
