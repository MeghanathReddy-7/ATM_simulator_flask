# Frontend Dockerfile: builds Vite app and serves via Nginx with API proxy

# ---- Build stage ----
FROM node:18-alpine AS build
WORKDIR /app

# Install deps
COPY package.json package-lock.json* bun.lockb* ./
RUN npm ci --no-audit --no-fund || npm install

# Copy sources and build
COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Runtime stage ----
FROM nginx:alpine

# Copy custom nginx config (proxies /api to backend service)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]