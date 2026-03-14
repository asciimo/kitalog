FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS backend
CMD ["node", "--watch", "backend/server.js"]

FROM base AS frontend
CMD ["npx", "vite", "--host"]
