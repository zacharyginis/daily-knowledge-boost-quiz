
# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Install express for serving (add to package.json instead of installing separately)
RUN npm install express --save

# Expose port (Cloud Run uses PORT environment variable)
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
