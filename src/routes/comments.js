import express from "express";
import asyncHandler from "express-async-handler";
import { createError } from "../errors/errors.js";
import commentsService from "../service/CommentsService.js";
import {
  schemaGetCommentsByMovieId,
  schemaAddComment,
  schemaUpdateComment,
  schemaDeleteComment,
  schemaGetCommentsByUserId,
} from "../validation/commentsSchemas.js";
import { validator } from "../middleware/validation.js";

const commentsRoute = express.Router();

// get a movie comments
commentsRoute.get(
  "/:id",
  validator(schemaGetCommentsByMovieId),
  asyncHandler(async (req, res) => {
    const comments = await commentsService.getMovieComments(req.params.id);
    if (comments.length === 0) {
      throw createError(
        404,
        `comments for movie with id ${req.params.id} doesn't exist`
      );
    }
    res.status(200).json(comments);
  })
);

// add a comment
commentsRoute.post(
  "/",
  validator(schemaAddComment),
  asyncHandler(async (req, res) => {
    const comment = await commentsService.addComment(req.body);
    res.status(201).send(comment);
  })
);

//update a comment
commentsRoute.put(
  "/",
  validator(schemaUpdateComment),
  asyncHandler(async (req, res) => {
    const comment = await commentsService.updateComment(req.body);
    res.status(200).send(comment);
  })
);

// delete a comment
commentsRoute.delete(
  "/:commentId",
  validator(schemaDeleteComment),
  asyncHandler(async (req, res) => {
    await commentsService.deleteComment(req.params.commentId);
    res.status(200).send("deleted comment");
  })
);

// get all comments by user
commentsRoute.get(
  "/user/:email",
  validator(schemaGetCommentsByUserId),
  asyncHandler(async (req, res) => {
    const comments = await commentsService.getUserComments(req.params.email);
    res.status(200).json(comments);
  })
);

export default commentsRoute;
