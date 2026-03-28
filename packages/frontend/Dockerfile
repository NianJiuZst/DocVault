# ============================================
# Stage 1: Builder
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root workspace files for monorepo pnpm install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend/package.json ./packages/backend/package.json
COPY packages/frontend/package.json ./packages/frontend/package.json

# Enable corepack and install all workspace dependencies
RUN corepack enable && pnpm install --frozen-lockfile

# Copy all source code
COPY . .

# Move to frontend package and build
WORKDIR /app/packages/frontend

# Build Next.js application
RUN pnpm build

# ============================================
# Stage 2: Production Runtime
# ============================================
FROM node:22-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy built Next.js artifacts from builder
COPY --from=builder --chown=nextjs:nodejs /app/packages/frontend/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/packages/frontend/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/packages/frontend/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/packages/frontend/package.json ./package.json

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Next.js standalone server
CMD ["pnpm", "start"]
