# ---------- Stage 1: Build React Frontend ----------
FROM node:20-alpine AS frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client ./
RUN npm run build

# ---------- Stage 2: Node Backend ----------
FROM node:20-alpine AS backend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Copy React build into backend's public folder
COPY --from=frontend /app/client/build ./client/build

EXPOSE 5000
CMD ["node", "server.js"]