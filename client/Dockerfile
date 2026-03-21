# Development Dockerfile for frontend
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source
COPY . .

# Expose port
EXPOSE 5173

# Start dev server
CMD ["pnpm", "dev", "--host", "0.0.0.0"]
