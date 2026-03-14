# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start Vite frontend dev server (port 5173, with HMR)
node server.js     # Start Express backend separately (port 3000)
npm start          # Production: run backend only (same as node server.js)
npm test           # Run Vitest tests
```

Dev mode requires two terminals: one for `node server.js`, one for `npm run dev`. Access the app at `http://localhost:5173`.

Copy `env.example` to `.env` before running. Key vars: `PORT` (backend), `VITE_BACKEND_PORT` (used by frontend to connect WebSocket directly to backend).

## Architecture

Kitalog is a LAN-local sharing app (files, images, links, text) with no auth or cloud dependency. It's a Node.js/Express server with a vanilla JS single-page frontend.

**Entry point:** `server.js` — creates an HTTP server shared by Express and WebSocket, mounts routes, and logs the LAN IP on startup.

**Data flow:**
1. Client POSTs to `/api/upload` (multipart) or `/api/message` (JSON) via `routes/api.js`
2. `api.js` appends to the in-memory `catalog` array and persists it to `data/kitalog.json`
3. After each write, the API route returns the new item — but **the WebSocket broadcast is not yet wired up** (the `broadcast` function from `routes/websocket.js` is returned but not called in `api.js`)
4. On WebSocket connection, `routes/websocket.js` sends the full `catalog` as an `init` message; new items arrive as `new` messages
5. Frontend (`public/index.html`) connects via WebSocket and renders items into `#stream`

**Persistence:** Uploaded files are stored in `data/items/` (multer uses UUID filenames). The catalog index is `data/kitalog.json`. Both are gitignored.

**Key module constraint:** The project uses `"type": "module"` (ESM), so all imports use `import`/`export` syntax and require `.js` extensions. Jest requires `--experimental-vm-modules` to handle ESM.

**Utils:**
- `utils/get-local-ip.js` — finds the first non-loopback IPv4 address for display
- `utils/fetch-open-graph.js` — scrapes OG tags from URLs using `node-fetch` + `cheerio`; called when a message contains a URL
