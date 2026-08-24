# Static site served by nginx on Build.io (listens on $PORT)
FROM nginx:1.27-alpine

COPY index.html styles.css app.js data.js models-live.js favicon.png /usr/share/nginx/html/
COPY samples /usr/share/nginx/html/samples

# Stamp cache-busting version at build time (same as the Pages workflow)
RUN sed -i "s/__BUILD__/$(date +%s)/g" /usr/share/nginx/html/index.html

# Build.io routes traffic to $PORT — reconfigure nginx at container start
CMD ["/bin/sh", "-c", "sed -i \"s/listen       80;/listen       ${PORT:-8080};/g\" /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
