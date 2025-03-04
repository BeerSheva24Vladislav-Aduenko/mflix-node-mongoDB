import Joi from "joi";

export const schemaGetCommentsByMovieId = Joi.object({
  params: {
    id: Joi.string().hex().length(24).required(),
  },
});

export const schemaAddComment = Joi.object({
    movie_id: Joi.string().hex().length(24).required(),
    email: Joi.string().email().required(),
    text: Joi.string().min(1).required(),
  });
  
  export const schemaUpdateComment = Joi.object({
    commentId: Joi.string().hex().length(24).required(),
    email: Joi.string().email().required(),
    text: Joi.string().min(1).required(),
  });
  
  export const schemaDeleteComment = Joi.object({
    params: {
      commentId: Joi.string().hex().length(24).required(),
    },
  });
  
  export const schemaGetCommentsByUserId = Joi.object({
    params: {
      email: Joi.string().email().required(),
    },
  });
  