import winston from "winston";

const isProduction = process.env.NODE_ENV === "production";

const defaultLogLevel = isProduction ? "info" : "debug";

const logLevel = process.env.LOG_LEVEL || defaultLogLevel;

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),

    winston.format.colorize(),

    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
