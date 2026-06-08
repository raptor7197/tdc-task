FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json vite.config.ts index.html ./
COPY src/ ./src/
RUN npm run build

FROM nginx:alpine AS runner

    COPY --from=builder /app/dist/ /usr/share/nginx/html/
    COPY nginx.conf /etc/nginx/conf.d/default.conf.template
    COPY docker-entrypoint.sh /docker-entrypoint.sh
    RUN chmod +x /docker-entrypoint.sh

    EXPOSE 80
    ENTRYPOINT ["/docker-entrypoint.sh"]
