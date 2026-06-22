# Development Dockerfile for frontend
FROM node:20-bookworm-slim

WORKDIR /app

# Install system dependencies for Playwright
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm for dependency management
RUN npm install -g pnpm@10.4.1

# Copy package files from root
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install dependencies using pnpm
RUN pnpm install

# Preserve directory structure for Vite/TS compatibility
COPY client/ ./client/
COPY shared/ ./shared/

# Copy config files from root
COPY vite.config.ts ./vite.config.ts
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.node.json ./tsconfig.node.json

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser -m appuser

# Ensure app directory is owned by non-root user
RUN chown -R appuser:appuser /app

USER appuser

# Expose port
EXPOSE 7000

# Start dev server from the project root
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0", "--port", "7000"]
