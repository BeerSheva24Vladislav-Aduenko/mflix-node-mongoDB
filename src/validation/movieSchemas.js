import Joi from "joi";
import config from "config";
const currentYear = new Date().getFullYear();

export const schemaMoviesById = Joi.object({
  params: {
    id: Joi.string().hex().length(24).required(),
  },
});

export const schemaMoviesFilter = Joi.object({
  params: {
    year: Joi.number()
      .min(config.get("validation.start_cinema_epoch"))
      .max(currentYear)
      .optional(),
    actor: Joi.string()
      .regex(/^[A-Za-z ]+$/)
      .optional(),
    genres: Joi.array().items(Joi.string()).optional(),
    languages: Joi.array().items(Joi.string()).optional(),
    amount: Joi.number()
      .min(1)
      .max(config.get("validation.max_amount"))
      .required(),
  },
});

export const schemaUpdateRating = Joi.object({
    imdbId: Joi.number().integer().min(1).required(),
    rating: Joi.number().min(1).max(10).required(),
  });