import { createError } from "../errors/errors.js";
import moviesService from "../service/MoviesService.js";
import accountService from "../service/AccountsService.js";
import config from "config";

const REQUEST_LIMIT = config.get("limitation.user_requests_count") || 10;
const TIME_LIMIT = config.get("limitation.user_time_limit") || 60 * 60 * 1000;

const moviesPathes = {
  GET: {
    authentication: (req) => "JWT",
    authorization: async (req) => {
      if (req.role === "ADMIN") {
        throw createError(403, "Access denied");
      }
      if (req.role === "PREMIUM_USER") {
        return true;
      }
      if (req.role === "USER") {
        await accountService.checkRequestLimit(req.user, REQUEST_LIMIT);
        await accountService.checkTimeLimit(req.user, TIME_LIMIT);
        return true;
      }
    },
  },

  POST: {
    authentication: (req) => "JWT",
    authorization: async (req) => {
      if (req.role !== "PREMIUM_USER") {
        throw createError(403, "Only PREMIUM_USER can rate movies");
      }
      const { imdbId } = req.body;
      const existingRate = await moviesService.hasUserRated(req.user, imdbId);
      if (existingRate) {
        throw createError(
          403,
          `User ${req.user} already rated movie ${imdbId}`
        );
      }
      return true;
    },
  },
};

export default moviesPathes;
