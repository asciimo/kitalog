import express from "express";
import multer from "multer";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { fetchOpenGraph } from "../utils/fetch-open-graph.js";
import path from "path";

const router = express.Router();
const DATA_DIR = path.join(process.cwd(), "data");
const ITEMS_DIR = path.join(DATA_DIR, "items");
const INDEX_FILE = path.join(DATA_DIR, "kitalog.json");
const upload = multer({ dest: ITEMS_DIR });
let catalog = [];

if (fs.existsSync(INDEX_FILE)) {
  catalog = JSON.parse(fs.readFileSync(INDEX_FILE));
}

router.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  const item = {
    id: uuidv4(),
    type: "file",
    timestamp: new Date().toISOString(),
    filename: file.originalname,
    path: file.filename,
    url: `/items/${file.filename}`,
  };
  catalog.push(item);
  fs.writeFileSync(INDEX_FILE, JSON.stringify(catalog, null, 2));
  res.json(item);
});

router.post("/message", async (req, res) => {
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
  res.json(item);
});

export { router as apiRouter, catalog };
