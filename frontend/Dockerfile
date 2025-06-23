# Multi-stage Dockerfile for Frontend

# Build Stage
FROM node:18-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
RUN npm install -g vite
COPY . .
RUN npm run build

# Development Stage
FROM node:18-alpine AS development
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN npm install -g vite
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

# Production Stage
FROM nginx:1.23.3-alpine AS production
# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]