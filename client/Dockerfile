# Development Dockerfile for frontend
FROM node:20-alpine

WORKDIR /app

# Copy package files from root
COPY package*.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source from client/ subdirectory
COPY client/src ./src
COPY client/index.html ./client/index.html
COPY client/public ./public

# Copy config files from root
COPY vite.config.ts ./vite.config.ts
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.node.json ./tsconfig.node.json

# Expose port
EXPOSE 5173

# Start dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
