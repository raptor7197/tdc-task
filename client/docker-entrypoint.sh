#!/bin/sh
set -e

API_URL="${API_URL:-http://localhost:3001}"

sed "s|__API_URL__|$API_URL|g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

if [ -f /app/dist/index.js ]; then
    # Combined container: nginx + node
    nginx -g "daemon on;"
    exec node /app/dist/index.js
else
    # Client-only: just nginx
    exec nginx -g "daemon off;"
fi
