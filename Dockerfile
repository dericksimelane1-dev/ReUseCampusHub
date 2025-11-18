# ---------- Stage 1: Build React Frontend ----------
FROM node:20-alpine AS frontend
WORKDIR /app
COPY client/package*.json ./client/
RUN cd client && npm ci
COPY client ./client
RUN cd client && npm run build

# ---------- Stage 2: Node Backend ----------
FROM node:20-alpine AS backend
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm ci
COPY server ./server

# Copy React build into backend's public folder
COPY --from=frontend /app/client/build ./server/public

EXPOSE 5000
CMD ["node", "server/index.js"]
