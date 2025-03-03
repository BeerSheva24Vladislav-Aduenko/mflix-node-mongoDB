import express from "express";
import asyncHandler from "express-async-handler";
import { validator } from "../middleware/validation.js";
import moviesService from "../service/MoviesService.js";
import {
  schemaMoviesFilter,
  schemaMoviesById,
  schemaUpdateRating,
} from "../validation/movieSchemas.js";

const moviesRoute = express.Router();

// get most rated movies
moviesRoute.get(
  "/mostrated",
  validator(schemaMoviesFilter),
  asyncHandler(async (req, res) => {
    const movies = await moviesService.getMostRated(req.query);
    res.status(200).json(movies);
  })
);

// get most commented movies
moviesRoute.get(
  "/mostcommented",
  validator(schemaMoviesFilter),
  asyncHandler(async (req, res) => {
    const movies = await moviesService.getMostCommented(req.query);
    res.status(200).json(movies);
  })
);

//get movies
moviesRoute.get(
  "/:id",
  validator(schemaMoviesById),
  asyncHandler(async (req, res) => {
    const movie = await moviesService.getMovie(req.params.id);
    res.status(200).json(movie);
  })
);

// post rate to movie
moviesRoute.post(
  "/rate",
  validator(schemaUpdateRating),
  asyncHandler(async (req, res) => {
    const movie = await moviesService.addRate(req);
    res.status(200).json(movie);
  })
);

export default moviesRoute;
