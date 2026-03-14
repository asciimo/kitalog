import { log } from "../utils/logger.js";
import express from "express";
import multer from "multer";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { enrich } from "../handlers/index.js";

const DATA_DIR = path.join(process.cwd(), "data");
const ITEMS_DIR = path.join(DATA_DIR, "items");
const INDEX_FILE = path.join(DATA_DIR, "kitalog.json");
const upload = multer({ dest: ITEMS_DIR });
let catalog = [];

if (fs.existsSync(INDEX_FILE)) {
  log.info(`Loading catalog from ${INDEX_FILE}`);
  catalog = JSON.parse(fs.readFileSync(INDEX_FILE));
}

function createApiRouter(broadcast) {
  const router = express.Router();

  router.post("/upload", upload.single("file"), (req, res) => {
    log.info(`File upload received: ${req.file.originalname}`);
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
    broadcast(item);
    res.json(item);
  });

  router.post("/message", async (req, res) => {
    log.info(`Message received: ${req.body.content}`);
    const content = req.body.content;
    const urlMatch = content.match(/https?:\/\/[^\s]+/);
    const url = urlMatch ? urlMatch[0] : null;

    const item = {
      id: uuidv4(),
      type: "text",
      timestamp: new Date().toISOString(),
      content,
      url,
    };

    const enriched = await enrich(item);
    catalog.push(enriched);
    fs.writeFileSync(INDEX_FILE, JSON.stringify(catalog, null, 2));
    broadcast(enriched);
    res.json(enriched);
  });

  return router;
}

export { createApiRouter, catalog };
