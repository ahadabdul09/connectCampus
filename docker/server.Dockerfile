# Multi-stage Dockerfile for connectCampus JavaScript Express Backend
FROM node:20-alpine AS runner

WORKDIR /app

# Install build dependencies for native modules if needed
RUN apk add --no-cache python3 make g++ curl

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm install --omit=dev
RUN npx prisma generate

COPY . .

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push && node src/server.js"]
