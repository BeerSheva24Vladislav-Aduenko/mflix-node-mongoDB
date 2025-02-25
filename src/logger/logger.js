import fs from "node:fs";
import morgan from "morgan";
import config from "config";
const streamConfig = config.get("morgan.stream");
const stream =
  streamConfig == "console"
    ? process.stdout
    : fs.createWriteStream(streamConfig, { flags: "a" });
const morganType = config.get("morgan.type");
export const logger = morgan(morganType, { stream });
