import { ObjectId } from "mongodb";
import CommentsService from "../service/CommentsService.js";

const commentsPathes = {
  GET: {
    authentication: (req) => "JWT",
    authorization: (req) => true,
  },

  POST: {
    authentication: (req) => "JWT",
    authorization: (req) =>
      req.role === "PREMIUM_USER" && req.user === req.body.email,
  },
  DELETE: {
    authentication: (req) => "JWT",
    authorization: async (req) => {
      try {
        const comment = ObjectId.createFromHexString(req.url.substring(1));
        const commentOwner = await CommentsService.getComment(comment);
        const { email } = commentOwner;
        return (
          (req.role === "PREMIUM_USER" && req.user === email) ||
          req.role === "ADMIN"
        );
      } catch (error) {
        console.error("Error in DELETE authorization:", error.message);
        return false;
      }
    },
  },
  PUT: {
    authentication: (req) => "JWT",
    authorization: (req) =>
      (req.role === "PREMIUM_USER" && req.user === req.body.email) ||
      req.role === "ADMIN",
  },
};

export default commentsPathes;
