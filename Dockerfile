# Use Node.js 20 Alpine for lightweight image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all project files
COPY . .

# Fix react-scripts permission
RUN chmod +x node_modules/.bin/react-scripts

# Build React app
RUN npm run build

# Install serve globally to serve React build
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["serve", "-s", "build", "-l", "3000"]