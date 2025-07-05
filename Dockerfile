
# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build the React app (this needs dev dependencies like Vite)
RUN npm run build

# Remove dev dependencies after build to reduce image size
RUN npm prune --production

# Install express for serving the built app
RUN npm install express --save

# Expose port (Cloud Run uses PORT environment variable)
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
