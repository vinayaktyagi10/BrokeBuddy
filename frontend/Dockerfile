# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy only package.json and lock file first
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Now copy the rest of the app
COPY . .

# Build the production-ready app
RUN npm run build

# Install serve to serve the build folder
RUN npm install -g serve

# Serve build directory
CMD ["serve", "-s", "build"]

EXPOSE 3000
