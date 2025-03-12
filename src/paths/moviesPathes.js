import { createError } from "../errors/errors.js";
import moviesService from "../service/MoviesService.js";
import config from "config";

const REQUEST_LIMIT = config.get("limitation.user_requests_count");
const TIME_LIMIT = config.get("limitation.user_time_limit");

const moviesPathes = {
  GET: {
    authentication: (req) => "JWT",
    authorization: (req) => {
      if (req.role === "ADMIN") {
        throw createError(403, "Access denied");
      }

      if (req.role === "PREMIUM_USER") {
        return true;
      }
      if (req.role === "USER") {

      }
    },
  },

  POST: {
    authentication: (req) => "JWT",
    authorization: async (req) => {
      checkUserRole(req);
      const { imdbId } = req.body;
      try {
        const existingRate = await moviesService.hasUserRated(req.user, imdbId);
        return !existingRate;
      } catch (error) {
        console.error("Error in POST authorization:", error.message);
        return false;
      }
    },
  },
};

export default moviesPathes;

function checkUserRole(req) {
  if (req.role !== "PREMIUM_USER") {
    throw createError(403, "Access denied");
  }
}
