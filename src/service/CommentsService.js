import config from "config";
import { ObjectId } from "mongodb";
import { createError } from "../errors/errors.js";
import mongoConnection from "../db/MongoConnection.js";
import accountService from "./AccountsService.js";

class CommentsService {
  #comments;
  constructor() {
    this.#comments = mongoConnection.getCollection(
      config.get("db.comments_collection")
    );
  }
  async getMovieComments(id) {
    const comments = [
      {
        $match: {
          movie_id: ObjectId.createFromHexString(id),
        },
      },
      {
        $project: {
          _id: 0,
          email: 1,
          text: 1,
        },
      },
    ];
    return await this.#comments.aggregate(comments).toArray();
  }

  async addComment({ movie_id, email, text }) {
    const user = await accountService.getAccount(email);
    const objectId = ObjectId.createFromHexString(movie_id);
    const comment = {
      name: user.username,
      movie_id: objectId,
      email,
      text,
      date: new Date(),
    };

    const newComment = await this.#comments.insertOne(comment);
    const result = await this.getComment(newComment.insertedId);
    return { ...result };
  }

  async getComment(id) {
    const comment = await this.#comments.findOne({ _id: id });
    if (!comment) {
      throw createError(404, `comment with id ${id} doesn't exist`);
    }
    return comment;
  }

  async updateComment({ commentId, email, text }) {
    await accountService.getAccount(email);
    const objectId = ObjectId.createFromHexString(commentId);
    const updatedComment = {
      text,
      date: new Date(),
    };
    const result = await this.#comments.findOneAndUpdate(
      { _id: objectId, email },
      { $set: updatedComment },
      { returnDocument: "after" }
    );
    if (!result) {
      throw createError(404, `comment with id ${commentId} doesn't exist`);
    }
    return result;
  }

  async deleteComment(commentId) {
    const objectId = ObjectId.createFromHexString(commentId);
    const deletedComment = await this.#comments.findOneAndDelete({
      _id: objectId,
    });
    if (!deletedComment) {
      throw createError(404, `comment with id ${commentId} doesn't exist`);
    }
    return deletedComment;
  }

  async getUserComments(email) {
    const comments = await this.#comments.find({ email }).toArray();
    if (comments.length === 0) {
      throw createError(
        404,
        `comments for user with email ${email} doesn't exist`
      );
    }
    return comments;
  }
}

const commentsService = new CommentsService();
export default commentsService;
