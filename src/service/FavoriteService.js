import { ObjectId } from "mongodb";
import { addFavoriteMongo, getFavoritesByEmail, updatedFavoriteMongo, deleteFavoriteMongo, existingFavorite } from "../mongo/favorites.js";
import { createError } from "../errors/errors.js";
import { isUserExists } from "../mongo/user.js";


class FavoritesService {
  async addFavorite({ email, movie_id, feed_back, viewed }) {
    const checkExists = await isUserExists(email);
    if (!checkExists) {
      throw createError(401, `account with email: ${email} doesn't exists`);
    }
    const favoriteExists = await existingFavorite(email, movie_id);
    if (favoriteExists) {
      throw createError(409, "This movie is already in favorites");
    }
  
    const favorite = {
      _id: new ObjectId(),
      email,
      movie_id: new ObjectId(movie_id),
      feed_back: feed_back || null,
      viewed: viewed ?? false,
    };

    await addFavoriteMongo(favorite);

    return favorite;
  }

  async getUserFavoriteMovies(email) {
    const checkExists = await isUserExists(email);
    if (!checkExists) {
      throw createError(401, `account with email: ${email} doesn't exists`);
    }
    return await getFavoritesByEmail(email);
  }


  async updateFavorite({ favoriteId, viewed, feed_back, email }) {
    const updateFields = {};
    if (viewed !== undefined) updateFields.viewed = viewed;
    if (feed_back !== undefined) updateFields.feed_back = feed_back;
  
    const updatedFavorite = await updatedFavoriteMongo(updateFields, favoriteId, email);

    if (!updatedFavorite) {
      throw createError(404, "Favorite doesn't exist");
    }
    return updatedFavorite;
  }

  async deleteFavorite({ favoriteId, email }) {
    const deletedFavorite = await deleteFavoriteMongo(favoriteId, email);
    
    if (!deletedFavorite) {
      throw createError(404, "Favorite doesn't exist");
    }
    return deletedFavorite;
  }
}




const favoritesService = new FavoritesService();
export default favoritesService;
