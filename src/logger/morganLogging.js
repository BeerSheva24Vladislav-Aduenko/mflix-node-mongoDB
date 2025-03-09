import morgan from "morgan";
import fs from "fs";
import path from "path";
import { createStream } from "rotating-file-stream";
import config from "config";

const logDirectory = path.resolve("logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const accessLogStream = createStream("access.log", {
  interval: "1d",
  path: logDirectory,
  maxFiles: 14,
  maxSize: "20M",
});

const errorLogStream = createStream("error.log", {
  interval: "1d",
  path: logDirectory,
});

const morganType =
  config.get("morgan.type") ||
  (process.env.NODE_ENV === "production" ? "combined" : "dev");

export const morganAccessLogger = morgan(morganType, {
  stream: accessLogStream,
});

export const morganErrorLogger = morgan(morganType, {
  stream: errorLogStream,
  skip: (req, res) => !(res.statusCode === 401 || res.statusCode === 403),
});