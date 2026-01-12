# CampVerse Backend Dockerfile
# For local development with Node.js/Express

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./

# Install dependencies including devDependencies for nodemon
RUN npm ci

# Copy source code
COPY . .

# Expose backend port
EXPOSE 5000

# Start development server with nodemon for hot-reload
CMD ["npm", "run", "dev"]
