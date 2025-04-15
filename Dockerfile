# Build stage
FROM node:20-alpine3.21 AS builder
WORKDIR /app

# Install build dependencies for bcrypt
RUN apk add --no-cache python3 make g++ linux-headers

# Copy package files and install dependencies
COPY package.json package-lock.json ./
# Update npm to the latest version
RUN npm install -g npm@latest && npm ci --production

# Copy source code
COPY src/ ./src

# Runtime stage
FROM node:20-alpine3.21
WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only production dependencies and app code
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY package.json ./

# Set ownership and permissions
RUN chown -R appuser:appgroup /app && chmod -R 750 /app

# Switch to non-root user
USER appuser
EXPOSE 3000

# Healthcheck to ping the /health endpoint
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "src/index.js"]