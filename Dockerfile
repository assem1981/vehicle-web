# ==============================================================================
# Stage 1: Install Dependencies
# ==============================================================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ==============================================================================
# Stage 2: Build Next.js Web Frontend Application
# ==============================================================================
FROM node:20-alpine AS builder
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

RUN npm install --include=dev && npm run build

# ==============================================================================
# Stage 3: Production Lightweight Node Runner
# ==============================================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy assets and standalone output build files
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
