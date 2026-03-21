# Development Dockerfile for frontend
FROM mcr.microsoft.com/playwright:alpine

WORKDIR /app

# Install pnpm for dependency management
RUN npm install -g pnpm@10.4.1

# Skip redundant browser downloads (already in base image)
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Copy package files from root
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Preserve directory structure for Vite/TS compatibility
COPY client/ ./client/
COPY shared/ ./shared/

# Copy config files from root
COPY vite.config.ts ./vite.config.ts
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.node.json ./tsconfig.node.json

# Expose port
EXPOSE 7000

# Start dev server from the project root
CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "7000"]
