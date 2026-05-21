# Frontend: politician.bawlmorean.com
# Place this at /etc/nginx/sites-available/politician.bawlmorean.com
# Then: ln -s /etc/nginx/sites-available/politician.bawlmorean.com /etc/nginx/sites-enabled/

server {
    listen 80;
    listen [::]:80;
    server_name politician.bawlmorean.com;

    # Certbot will add the 443 block here after you run:
    #   sudo certbot --nginx -d politician.bawlmorean.com

    root /var/www/politician.bawlmorean.com;
    index index.html;

    # Gzip for static assets
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

    # Cache static assets aggressively
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|otf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # SPA fallback — React Router handles client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
