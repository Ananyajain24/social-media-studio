# ── Base: Manim (Python + FFmpeg + all Manim deps pre-installed) ──────────────
FROM manimcommunity/manim:stable

USER root

# ── Add Node.js 20 ────────────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Frontend: install deps & build ───────────────────────────────────────────
COPY frontend/package*.json frontend/
RUN cd frontend && npm install

COPY frontend/ frontend/
RUN cd frontend && npm run build

# ── Backend: install deps ────────────────────────────────────────────────────
COPY backend/package*.json backend/
RUN cd backend && npm install --omit=dev

COPY backend/ backend/

# ── Copy frontend build into backend/public (served as static files) ─────────
RUN mkdir -p backend/public && cp -r frontend/dist/. backend/public/

# ── Create runtime output directories ────────────────────────────────────────
RUN mkdir -p backend/output/audio backend/output/merged backend/temp

EXPOSE 3001

ENV NODE_ENV=production

WORKDIR /app/backend

CMD ["node", "src/index.js"]
