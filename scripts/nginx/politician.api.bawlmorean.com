# Backend API: politician.api.bawlmorean.com
# Place this at /etc/nginx/sites-available/politician.api.bawlmorean.com
# Then: ln -s /etc/nginx/sites-available/politician.api.bawlmorean.com /etc/nginx/sites-enabled/

# The upstream is dynamically updated by deploy.sh during zero-downtime swaps.
# On first install, create this file manually:
#   sudo tee /etc/nginx/conf.d/api-upstream.conf << 'EOF'
#   upstream civic_api {
#       server 127.0.0.1:3001;
#   }
#   EOF

server {
    listen 80;
    listen [::]:80;
    server_name politician.api.bawlmorean.com;

    # Certbot will add the 443 block here after you run:
    #   sudo certbot --nginx -d politician.api.bawlmorean.com

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass http://civic_api;
        proxy_http_version 1.1;

        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts for slow external API calls (Congress.gov, OpenStates)
        proxy_connect_timeout 30s;
        proxy_send_timeout    30s;
        proxy_read_timeout    60s;

        # Buffering — disable for streaming logs if you add SSE later
        proxy_buffering on;
        proxy_buffer_size   4k;
        proxy_buffers       8 4k;
    }

    # Health check endpoint (bypasses upstream for direct port check if needed)
    location /health {
        proxy_pass http://civic_api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
    }
}
