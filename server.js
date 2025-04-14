import dotenv from "dotenv";
dotenv.config();

import { log } from "./utils/logger.js";
import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { apiRouter, catalog } from "./routes/api.js";
import { setupWebSocket } from "./routes/websocket.js";
import { getLocalIp } from "./utils/get-local-ip.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use((req, res, next) => {
  log.info(`[HTTP] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use("/api", apiRouter);
app.use("/items", express.static(path.join(__dirname, "data", "items")));
app.use(express.static(path.join(__dirname, "public")));

log.info(`Loading catalog with ${catalog.length} items`);

const { broadcast } = setupWebSocket(server, catalog);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

server.listen(PORT, HOST, () => {
  log.info(`Kitalog server running at http://${HOST}:${PORT}`);
  log.info(`Find it on your LAN at http://${getLocalIp()}:${PORT}`);
});
