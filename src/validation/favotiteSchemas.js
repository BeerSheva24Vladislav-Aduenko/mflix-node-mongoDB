import Joi from "joi";
import { ObjectId } from "mongodb";

const objectIdSchema = Joi.string().custom((value, helpers) => {
    if (!ObjectId.isValid(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  }, "ObjectId validation");
  
  const emailSchema = Joi.string().email().required();

  export const schemaFavorite = Joi.object({
    email: emailSchema,
    movie_id: objectIdSchema.required(),
    feed_back: Joi.string().optional(),
    viewed: Joi.boolean().optional(),
  });
  
  export const schemaUpdateFavorite = Joi.object({
    favoriteId: objectIdSchema.required(),
    email: emailSchema,
    viewed: Joi.boolean().optional(),
    feed_back: Joi.string().optional(),
  });
  
  export const schemaDeleteFavorite = Joi.object({
    favoriteId: objectIdSchema.required(),
    email: emailSchema,
  });