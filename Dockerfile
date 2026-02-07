FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/
RUN npm install --production

# Copy built assets
COPY packages/api/dist ./packages/api/dist
COPY packages/ui/dist ./packages/ui/dist
COPY packages/admin/dist ./packages/admin/dist

# Create config directory
RUN mkdir -p /root/.0711

# Expose port
EXPOSE 7074

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:7074/api/health || exit 1

# Start
CMD ["node", "packages/api/dist/index.js"]
