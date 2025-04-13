import { WebSocketServer } from "ws";

export function setupWebSocket(server, catalog) {
  const wss = new WebSocketServer({ server });

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

  return { broadcast };
}
