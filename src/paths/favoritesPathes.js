const favoritesPathes = {
  GET: {
    authentication: (req) => "JWT",
    authorization: (req) =>
      req.role === "PREMIUM_USER" && req.user === req.url.substring(1),
  },

  POST: {
    authentication: (req) => "JWT",
    authorization: (req) =>
      req.role === "PREMIUM_USER" && req.user === req.body.email,
  },
  DELETE: {
    authentication: (req) => "JWT",
    authorization: (req) =>
      req.role === "PREMIUM_USER" && req.user === req.body.email,
  },
  PUT: {
    authentication: (req) => "JWT",
    authorization: (req) =>
      req.role === "PREMIUM_USER" && req.user === req.body.email,
  },
};

export default favoritesPathes;
