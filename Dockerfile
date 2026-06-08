FROM node:22-alpine AS server-builder

WORKDIR /server
COPY server/package*.json ./
RUN npm ci
COPY server/tsconfig.json ./
COPY server/src/ ./src/
RUN npx tsc

FROM node:22-alpine AS client-builder

WORKDIR /client
COPY client/package*.json ./
RUN npm ci
COPY client/tsconfig*.json client/vite.config.ts client/index.html ./
COPY client/src/ ./src/
RUN npm run build

FROM nginx:alpine

RUN apk add --no-cache nodejs npm curl

WORKDIR /app
COPY --from=server-builder /server/dist/ ./dist/
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/src/data/ ./dist/data/

COPY --from=client-builder /client/dist/ /usr/share/nginx/html/

COPY client/nginx.conf /etc/nginx/conf.d/default.conf.template
COPY client/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
CMD ["/docker-entrypoint.sh"]
