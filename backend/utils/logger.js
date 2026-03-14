import pino from "pino";
const transport = pino.transport({
  level: process.env.LOG_LEVEL || "info",
  target: "pino-pretty",
  options: {
    colorize: true,
    translateTime: "SYS:standard",
  },
});

export const log = pino(transport);
