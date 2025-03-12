const accountingPathes = {
  POST: {
    authentication: (req) => (req.path.includes("Admin") ? "basic" : ""),
    authorization: (req) =>
      req.path.includes("Admin") ? req.username === "ADMIN" : true,
  },
  DELETE: {
    authentication: (req) => "JWT",
    authorization: (req) =>
      req.user === "ADMIN" || req.user === req.url.substring(1),
  },
  PUT: {
    authentication: (req) => "JWT",
    authorization: (req) => {
      if (req.path.includes("role")) {
        return req.role === "ADMIN";
      } else if (req.path.includes("block") || req.path.includes("unblock")) {
        return req.role === "ADMIN";
      } else {
        return req.role === "ADMIN" || req.user === req.body.email;
      }
    },
  },
  GET: {
    authentication: (req) => "JWT",
    authorization: (req) =>
      req.role === "ADMIN" || req.user === req.url.substring(1),
  },
};

export default accountingPathes;
