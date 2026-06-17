# Stage 1: Dependencies (production only)
FROM node:20-alpine AS dependencies

RUN apk add --no-cache python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Stage 2: Build Prisma Client
FROM node:20-alpine AS prisma

RUN apk add --no-cache python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install && npm cache clean --force

# Stage 3: Production
FROM node:20-alpine AS production

# Install runtime dependencies only (not build tools)
RUN apk add --no-cache cairo jpeg pango giflib

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY package*.json ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=prisma /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=prisma /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=prisma /app/node_modules/prisma ./node_modules/prisma

COPY . .

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]