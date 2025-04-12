import os from "os";
import express from "express";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data", "items");
const INDEX_FILE = path.join(__dirname, "data", "kitalog.json");

let catalog = [];

try {
  const data = fs.readFileSync(INDEX_FILE);
  catalog = JSON.parse(data);
} catch {
  catalog = [];
  fs.writeFileSync(INDEX_FILE, JSON.stringify(catalog, null, 2));
}

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// WebSocket broadcast
wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "init", data: catalog }));
});

// Broadcast to all clients
function broadcast(item) {
  const message = JSON.stringify({ type: "new", data: item });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

// File upload handling
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

app.post("/api/message", (req, res) => {
  const item = {
    id: uuidv4(),
    type: "text",
    timestamp: new Date().toISOString(),
    content: req.body.content,
  };
  catalog.push(item);
  fs.writeFileSync(INDEX_FILE, JSON.stringify(catalog, null, 2));
  broadcast(item);
  res.json(item);
});

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Kitalog server running on http://${getLocalIp()}:${PORT}`);
});
