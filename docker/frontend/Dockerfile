FROM node:20-alpine AS build

WORKDIR /app

COPY interface/package.json interface/package-lock.json* ./
RUN npm ci

COPY interface/ ./
RUN npm run build

# Runtime image
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist/ /usr/share/nginx/html/

# SPA fallback
RUN rm -f /usr/share/nginx/html/index.html && true

EXPOSE 80

