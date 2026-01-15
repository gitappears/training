# Stage 1: Build the Quasar application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy application code FIRST
COPY . .

# Install dependencies (now scripts have access to all files)
RUN yarn install --frozen-lockfile

# Build the Quasar app
RUN yarn build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy the built files from the previous stage
# Verify the output directory, usually dist/spa for Quasar SPA mode. 
# If it's different (e.g., pwa, ssr), this needs adjustment. 
# Assuming default SPA build.
COPY --from=builder /app/dist/spa /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
