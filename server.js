import express from "express";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { fetchOpenGraph } from "./utils/fetch-open-graph.js";

// Paths and constants
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data", "items");
const INDEX_FILE = path.join(__dirname, "data", "kitalog.json");

// Livereload (only in development)
if (process.env.NODE_ENV !== "production") {
  const livereload = await import("livereload");
  const connectLivereload = (await import("connect-livereload")).default;

  const liveReloadServer = livereload.createServer();
  liveReloadServer.watch(path.join(__dirname, "public"));
  app.use(connectLivereload());

  liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
      liveReloadServer.refresh("/");
    }, 100);
  });
}

// Helpers
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

// Load catalog
let catalog = [];
try {
  const data = fs.readFileSync(INDEX_FILE);
  catalog = JSON.parse(data);
} catch {
  catalog = [];
  fs.writeFileSync(INDEX_FILE, JSON.stringify(catalog, null, 2));
}

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use("/items", express.static(DATA_DIR));
app.use(express.json());

// WebSocket broadcast
wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "init", data: catalog }));
});

function broadcast(item) {
  const message = JSON.stringify({ type: "new", data: item });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

// File uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, DATA_DIR),
  filename: (req, file, cb) =>
    cb(null, uuidv4() + path.extname(file.originalname)),
});
const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
  const item = {
    id: uuidv4(),
    type: "file",
    timestamp: new Date().toISOString(),
    filename: req.file.originalname,
    path: req.file.filename,
    url: `/items/${req.file.filename}`,
  };
  catalog.push(item);
  fs.writeFileSync(INDEX_FILE, JSON.stringify(catalog, null, 2));
  broadcast(item);
  res.json(item);
});

app.post("/api/message", async (req, res) => {
  const content = req.body.content;
  const urlMatch = content.match(/https?:\/\/[^\s]+/);
  const preview = urlMatch ? await fetchOpenGraph(urlMatch[0]) : null;

  const item = {
    id: uuidv4(),
    type: "text",
    timestamp: new Date().toISOString(),
    content,
    preview,
  };

  catalog.push(item);
  fs.writeFileSync(INDEX_FILE, JSON.stringify(catalog, null, 2));
  broadcast(item);
  res.json(item);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Kitalog server running at http://${getLocalIP()}:${PORT}`);
});
