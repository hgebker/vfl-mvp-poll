FROM node:24-alpine AS build
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV DATABASE_URL=local.db
RUN npm run build

FROM build AS migrator
CMD ["npx", "drizzle-kit", "migrate"]

FROM build AS pruned
RUN npm prune --omit=dev

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=pruned /app/build ./build
COPY --from=pruned /app/node_modules ./node_modules
COPY --from=pruned /app/package.json ./package.json
EXPOSE 3000
CMD ["node", "build"]
