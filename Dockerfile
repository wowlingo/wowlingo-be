# Base stage for installing dependencies
FROM node:20-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

# Builder stage for creating the production build
FROM base AS builder
COPY . .
RUN npm run build

# Dev stage for production on Ubuntu server
FROM node:20-alpine AS dev
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=base /usr/src/app/node_modules ./node_modules
COPY package*.json ./
ENV NODE_ENV=development
EXPOSE 3000
CMD ["node", "dist/main"]
