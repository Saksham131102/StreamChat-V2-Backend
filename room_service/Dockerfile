# --- Stage 1: Build ---
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# --- Stage 2: Runtime
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy only the production dependencies from the builder stage
COPY --from=builder /usr/src/app/package*.json ./
RUN npm install --only=production

# Copy the actual application code from the builder stage
COPY --from=builder /usr/src/app .

# This will be overridden by the 'expose' in docker-compose
EXPOSE 3003

CMD [ "node", "index.js" ]