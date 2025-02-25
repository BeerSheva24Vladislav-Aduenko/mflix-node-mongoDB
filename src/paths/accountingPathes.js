const accountingPathes = {
  POST: {
    authentication: (req) => (req.path.includes("Admin") ? "basic" : ""),
    authorization: (req) =>
      req.path.includes("Admin")
        ? req.username === process.env.ADMIN_USERNAME
        : true,
  },
  DELETE: {
    authentication: (req) => "basic",
    authorization: (req) =>
      req.user === process.env.ADMIN_USERNAME ||
      req.user === req.body.email,
  },
  PUT: {
    authentication: (req) => "basic",
    authorization: (req) =>
      req.user === process.env.ADMIN_USERNAME ||
      req.user === req.body.email,
  },
  GET: {
    authentication: (req) => "basic",
    authorization: (req) => req.user === process.env.ADMIN_USERNAME,
  },
};

export default accountingPathes;
