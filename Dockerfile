# Use an official Node.js runtime as a parent image
FROM node:20-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory in the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml to the working directory
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Generate Prisma client

# Copy the rest of the application code to the working directory
COPY . .

# Generate Prisma client during build so it's baked into the image
RUN pnpm prisma generate

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["sh", "-c", "pnpx prisma generate && pnpm tsx ./src/server.ts"]
