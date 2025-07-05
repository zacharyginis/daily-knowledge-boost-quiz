
# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Install express for serving
RUN npm install express

# Expose port
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
