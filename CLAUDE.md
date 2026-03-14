# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                  # Install dependencies
npm run dev                  # Start Vite frontend dev server (port 5173, with HMR)
node backend/server.js       # Start Express backend separately (port 3000)
npm start                    # Production: run backend only (same as node backend/server.js)
npm test                     # Run Vitest tests
```

Dev mode requires two terminals: one for `node backend/server.js`, one for `npm run dev`. Access the app at `http://localhost:5173`.

Copy `env.example` to `.env` before running. Key vars: `PORT` (backend), `VITE_BACKEND_PORT` (used by frontend to connect WebSocket directly to backend).

## Architecture

Kitalog is a LAN-local sharing app (files, images, links, text) with no auth or cloud dependency. It's a Node.js/Express server with a vanilla JS single-page frontend.

**Entry point:** `backend/server.js` — creates an HTTP server shared by Express and WebSocket, mounts routes, and logs the LAN IP on startup.

**Directory layout:**
```
frontend/
  index.html
  src/
    main.js
    logger.js
    components/
      index.js        ← component registry
      text.js
      link.js         ← generic OG preview; also exports renderContent + buildPreviewCard
      twitter.js
      reddit.js

backend/
  server.js
  routes/
    api.js
    websocket.js
  utils/
    logger.js
    get-local-ip.js
  handlers/
    index.js          ← registry: enrich(item) dispatches to the right handler
    text.js
    link/
      index.js        ← generic link handler (OG)
      twitter.js      ← oEmbed
      reddit.js       ← oEmbed
      facebook.js     ← OG
      instagram.js    ← OG
      bluesky.js      ← OG
      _oembed.js      ← shared oEmbed fetcher
      _og.js          ← shared OG scraper

data/                 ← gitignored
```

**Data flow:**
1. Client POSTs to `/api/upload` (multipart) or `/api/message` (JSON) via `backend/routes/api.js`
2. For text messages, `api.js` extracts the first URL, builds a base item, then calls `enrich(item)` from `backend/handlers/index.js`
3. `enrich` picks the right handler by testing `handler.match(item)` in priority order; the handler fetches OG/oEmbed data and sets `mediaType`
4. The enriched item is appended to the in-memory `catalog`, persisted to `data/kitalog.json`, and broadcast over WebSocket
5. On WebSocket connection, `routes/websocket.js` sends the full `catalog` as an `init` message; new items arrive as `new` messages
6. Frontend (`frontend/index.html`) connects via WebSocket; `addItem` dispatches to `renderItem(item)` from the component registry

**Item schema (text):**
```js
{ id, type: 'text', timestamp, content, url: string|null, mediaType: 'text'|'link'|'twitter'|'reddit'|'facebook'|'instagram'|'bluesky', preview: object|null }
```

**Handler interface:** each handler exports `match(item) => boolean` and `process(item) => Promise<enrichedItem>`.

**Component interface:** each component is `(item) => HTMLElement`.

**Persistence:** Uploaded files are stored in `data/items/` (multer uses UUID filenames). The catalog index is `data/kitalog.json`. Both are gitignored.

**Key module constraint:** The project uses `"type": "module"` (ESM), so all imports use `import`/`export` syntax and require `.js` extensions.

**Utils:**
- `backend/utils/get-local-ip.js` — finds the first non-loopback IPv4 address for display
- `backend/handlers/link/_og.js` — scrapes OG tags from URLs using `node-fetch` + `cheerio`
- `backend/handlers/link/_oembed.js` — fetches oEmbed JSON; normalizes to `{ title, description, image, url, author, authorUrl, platform }`
