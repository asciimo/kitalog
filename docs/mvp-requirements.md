# Kitalog MVP Requirements

**Kitalog** is a LAN-based web application for sharing files, images, links, and text messages with others on the same local network. It is inspired by the simplicity and immediacy of iMessage and AirDrop, but designed for the browser.

## 🎯 Core Goals
- Accessible via local IP (e.g. `http://192.168.1.x:3000`)
- No user accounts or authentication
- Persistent storage using the filesystem
- Real-time updates via WebSocket or SSE

---

## ✅ MVP Features

### 🖼️ Content Types
- **Files** (uploaded and downloadable)
- **Images** (instantly displayed inline)
- **Links** (displayed as plain text; previews optional later)
- **Text Messages** (like chat, but no replies)

### 🔗 Shareable Links
- Every shared item has a unique, LAN-accessible URL
- A 🔗 icon appears next to each item to easily copy its URL

### 🔄 Real-Time Updates
- New items broadcast to all connected clients without refresh

### 💾 Persistent Storage
- All shared content is written to disk
  - Files stored in `./data/items/`
  - Metadata stored in `kitalog.json`
- On server restart, the full history is reloaded from disk

### 📱 iOS Shortcut Support
- A preconfigured iOS Shortcut can share files, links, or text to the Kitalog server via HTTP POST
- Shortcut will be shareable via `.shortcut` file

---

## 📦 File Structure (Initial)
```
kitalog/
├── data/
│   ├── items/             # Uploaded files
│   └── kitalog.json       # Metadata index of shared items
├── public/                # Frontend assets
├── server.js              # Express or similar backend
└── README.md              # Project info
```

---

## 🔮 Future Features (Not in MVP)
- Link previews (OpenGraph scraping)
- Browser notifications for new items
- Mobile app (via Capacitor) to appear in iOS/Android share sheets
- File browser-style view of shared content
- Search functionality (e.g. full-text or filter by type)
- Support for deletion, expiration, or tags

---

## 🐈 Name
The project is named **Kitalog** — a play on "catalog" with a kitten vibe.
