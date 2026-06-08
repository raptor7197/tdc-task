#!/bin/sh
set -e

API_URL="${API_URL:-http://server:3001}"

sed "s|__API_URL__|$API_URL|g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g "daemon off;"
