# ==============================================================================
# Stage 1: Install Dependencies
# ==============================================================================
FROM node:22-slim AS deps
# Upgrade npm — bundled 10.9.x crashes in Docker with "Exit handler never called!"
RUN npm install -g npm@11
WORKDIR /app

COPY package.json package-lock.json ./

# Lockfile resolved URLs point to private Nexus proxy — rewrite to public registry
# (same tarball path layout, so a host swap is safe)
RUN sed -i 's|http://nexus-front.tradenet.com:5000|https://registry.npmjs.org|g' package-lock.json
RUN npm ci --include=dev --no-audit --no-fund

# ==============================================================================
# Stage 2: Build Next.js Web Frontend Application
# ==============================================================================
FROM node:22-slim AS builder
RUN npm install -g npm@11
WORKDIR /app

# NEXT_PUBLIC_* vars are baked into the bundle at build time
ARG NEXT_PUBLIC_API_BASE_URL=http://169.58.219.10/vehicle-api
ARG NEXT_PUBLIC_API_URL=http://169.58.219.10/vehicle-api
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_APPLE_CLIENT_ID

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_APPLE_CLIENT_ID=$NEXT_PUBLIC_APPLE_CLIENT_ID
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

COPY . .
COPY --from=deps /app/node_modules ./node_modules

RUN npm run build

# ==============================================================================
# Stage 3: Production Lightweight Node Runner
# ==============================================================================
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy assets and build output files
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
