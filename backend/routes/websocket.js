import { WebSocketServer } from "ws";
import { log } from "../utils/logger.js";

export function setupWebSocket(server, catalog) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    log.debug({ clients: wss.clients.size }, "[WS] Client connected");
    ws.send(JSON.stringify({ type: "init", data: catalog }));

    ws.on("close", () => {
      log.debug({ clients: wss.clients.size }, "[WS] Client disconnected");
    });

    ws.on("error", (err) => {
      log.warn({ err }, "[WS] Client socket error");
    });
  });

  function broadcast(item) {
    log.debug({ type: item.type, id: item.id, clients: wss.clients.size }, "[WS] Broadcasting item");
    const message = JSON.stringify({ type: "new", data: item });
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  }

  return { broadcast };
}
