import config from "config";
import { createError } from "../errors/errors.js";
import { ObjectId } from "mongodb";
import mongoConnection from "../db/MongoConnection.js";

class MoviesService {
  #movies;
  constructor() {
    this.#movies = mongoConnection.getCollection(
      config.get("db.movies_collection")
    );
  }
  async getMovie(id) {
    const objectId = ObjectId.createFromHexString(id);
    const movie = await this.#movies.findOne({ _id: objectId });
    if (!movie) {
      throw createError(404, `movie with id ${id} doesn't exist`);
    }
    return movie;
  }

  async getMostRated(filter) {
    const query = [
      { $match: { "imdb.rating": { $ne: "" } } },
      { $sort: { "imdb.rating": -1 } },
      { $limit: 1 },
      {
        $project: {
          _id: 1,
          title: 1,
          imdbId: "$imdb.id",
          rating: "$imdb.rating",
        },
      },
    ];
    return await this.#getFilter(query, filter);
  }

  async #getFilter(query, filter) {
    this.#addFilter(query, filter);
    const movies = await this.#movies.aggregate(query).toArray();
    if (movies.length === 0) {
      throw createError(404, "No movies with this filter");
    }
    return movies;
  }

  #addFilter(query, filter) {
    const { year, actor, genres, languages, amount } = filter;
    if (year) {
      query[0].$match.year = year;
    }
    if (actor) {
      query[0].$match.cast = new RegExp(actor, "i");
    }
    if (genres) {
      query[0].$match.genres = { $all: [genres] };
    }
    if (languages) {
      query[0].$match.languages = { $all: languages };
    }
    query[2].$limit = Number(amount) || 1;
  }

  async getMostCommented(filter) {
    const query = [
      { $match: {} },
      { $sort: { num_mflix_comments: -1 } },
      { $limit: 1 },
      {
        $project: {
          _id: 1,
          title: 1,
          imdbId: "$imdb.id",
          comments: "$num_mflix_comments",
        },
      },
    ];
    return await this.#getFilter(query, filter);
  }

  async addRate(req) {
    const { imdbId, rating } = req.body;
    const movie = await this.#movies.findOne({ "imdb.id": imdbId });
    if (!movie) {
      throw createError(404, `movie with imdbId ${imdbId} doesn't exist`);
    }
    const updatedMovie = await this.#movies.findOneAndUpdate(
      { "imdb.id": imdbId },
      { $set: { "imdb.rating": rating } },
      { returnDocument: "after" }
    );
    return updatedMovie
  }
}
const moviesService = new MoviesService();
export default moviesService;
