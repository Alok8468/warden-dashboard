# ══════════════════════════════════════════════════════════════════════════════
# WARDEN.AI Dashboard — Multi-stage Dockerfile
# Stage 1: build Vite/React app
# Stage 2: serve with nginx (alpine, ~25 MB image)
# ══════════════════════════════════════════════════════════════════════════════

# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (separate layer for better caching)
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# Copy source and build
COPY . .

# Build-time environment variables (can be overridden with --build-arg)
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build


# ── Stage 2: Serve with nginx ─────────────────────────────────────────────────
FROM nginx:1.25-alpine AS runner

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx config to avoid conflicts
RUN rm -f /etc/nginx/conf.d/default.conf.default

EXPOSE 80

# nginx runs as PID 1 in the foreground
CMD ["nginx", "-g", "daemon off;"]
