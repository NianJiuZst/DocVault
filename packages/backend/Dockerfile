# ============================================
# Stage 1: Builder
# ============================================
FROM node:22-alpine AS builder

# Install dependencies
WORKDIR /app

# Copy root workspace files for monorepo pnpm install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend/package.json ./packages/backend/package.json
COPY packages/frontend/package.json ./packages/frontend/package.json

# Enable corepack and install all workspace dependencies
RUN corepack enable && pnpm install --frozen-lockfile

# Copy all source code
COPY . .

# Move to backend package and build
WORKDIR /app/packages/backend

# Generate Prisma client (required for dist to compile)
RUN npx prisma generate

# Build NestJS application
RUN pnpm build

# ============================================
# Stage 2: Production Runtime
# ============================================
FROM node:22-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Copy built artifacts and node_modules from builder
COPY --from=builder --chown=nestjs:nodejs /app/packages/backend/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/backend/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages/backend/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/packages/backend/prisma ./prisma

# Switch to non-root user
USER nestjs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "dist/main.js"]
