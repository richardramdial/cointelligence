# Multi-stage build for Cointelligence

# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the Next.js app
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy from builder: node_modules, .next, and public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Copy additional files needed at runtime
COPY --from=builder /app/tsconfig.json ./
COPY src/payload.config.ts ./src/
COPY src/collections ./src/collections
COPY src/globals ./src/globals

# Create media directory
RUN mkdir -p /app/media

# Expose port 3000
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run migrations and start the app
CMD ["sh", "-c", "npm run payload migrate && node .next/standalone/server.js"]
