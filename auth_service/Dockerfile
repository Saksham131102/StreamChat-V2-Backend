# --- Stage 1: Build ---
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# Copy package files first (better caching)
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy Prisma files first (to share cache)
COPY prisma ./prisma
# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the source code
COPY . .


# --- Stage 2: Runtime ---
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy everything from builder
COPY --from=builder /usr/src/app ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "src/index.js"]