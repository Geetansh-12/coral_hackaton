# ============================================================
# CORAL CRM — Production Dockerfile
# Packages Next.js + Coral CLI binary for Render/Railway deploy
# ============================================================

# Stage 1: Install dependencies and build
FROM ubuntu:24.04 AS builder

WORKDIR /app

# Install curl, build tools, and Node.js 20
RUN apt-get update && \
    apt-get install -y curl ca-certificates python3 make g++ && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install Coral CLI (Linux binary)
ENV CORAL_VERSION=v0.3.0
RUN curl -fsSL https://withcoral.com/install.sh | sh

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build Next.js
RUN npm run build

# Seed the database so it's baked into the Docker image
RUN npm run seed

# Ensure optional directories exist so COPY doesn't fail
RUN mkdir -p public data

# Stage 2: Production runtime
FROM ubuntu:24.04 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install curl, ca-certificates, and Node.js 20
RUN apt-get update && \
    apt-get install -y curl ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Copy Coral binary AND its config/data from builder
COPY --from=builder /root/.local/bin/coral /usr/local/bin/coral
RUN chmod +x /usr/local/bin/coral

# Copy Coral's config directory from the builder (where source registry lives)
COPY --from=builder /root/.config/ /root/.config/

# Verify Coral works during build
RUN coral --version && coral source list

# Copy built app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/sql ./sql
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/data ./data

# Expose port
EXPOSE 3000

# Ensure Coral has a proper HOME directory
ENV HOME=/root

# Start the app
CMD ["npm", "start"]
