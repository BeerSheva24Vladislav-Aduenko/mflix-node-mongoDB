import express from "express";
import asyncHandler from "express-async-handler";
import { validator } from "../middleware/validation.js";
import {
  schemaUpdateFavorite,
  schemaDeleteFavorite,
  schemaFavorite,
} from "../validation/favotiteSchemas.js";
import favoritesService from "../service/FavoriteService.js";

const favoritesRoute = express.Router();
// favotitesRoute.use(auth(accountingPathes));

//add in favorites
favoritesRoute.post(
  "/",
  validator(schemaFavorite),
  asyncHandler(async (req, res) => {
    const favorites = await favoritesService.addFavorite(req.body);
    res.status(201).send(favorites);
  })
);

// get favorites by email
favoritesRoute.get(
  "/:email",
  asyncHandler(async (req, res) => {
    const favorites = await favoritesService.getUserFavoriteMovies(req.params.email);
    res.status(200).json(favorites);
  })
);

// Updating favorite
favoritesRoute.put(
  "/",
  validator(schemaUpdateFavorite),
  asyncHandler(async (req, res) => {
    const updatedFavorite = await favoritesService.updateFavorite(req.body);
    res.status(200).json(updatedFavorite);
  })
);

// Deleting favorite
favoritesRoute.delete(
  "/",
  validator(schemaDeleteFavorite),
  asyncHandler(async (req, res) => {    
    const deletedFavorite = await favoritesService.deleteFavorite(req.body);
    res.status(200).json(deletedFavorite);
  })
);
export default favoritesRoute;
