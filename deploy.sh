#!/bin/bash

# ============================================================================
# MySport Application Deployment Script
# Déploie l'application complète sur le VPS
# ============================================================================

set -e

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/opt/apps/mysport"
DOMAIN="mysport.woutils.com"
APP_NAME="mysport"
SERVER_PORT=5000
CLIENT_PORT=3000

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  MySport Deployment Script${NC}"
echo -e "${BLUE}================================${NC}\n"

# Vérifier si on est en root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ Ce script doit être exécuté en tant que root${NC}"
   exit 1
fi

echo -e "${YELLOW}📦 Étape 1: Installation des dépendances système...${NC}"
apt-get update
apt-get install -y \
    curl \
    wget \
    git \
    nodejs \
    npm \
    nginx \
    certbot \
    python3-certbot-nginx \
    sqlite3

echo -e "${GREEN}✅ Dépendances installées${NC}\n"

# Créer le répertoire d'application
echo -e "${YELLOW}📁 Étape 2: Création des répertoires...${NC}"
mkdir -p $APP_DIR
cd $APP_DIR

echo -e "${GREEN}✅ Répertoires créés${NC}\n"

# Cloner/Pull le repository
echo -e "${YELLOW}🔄 Étape 3: Récupération du code...${NC}"

if [ -d "$APP_DIR/.git" ]; then
    echo "Mise à jour du repository..."
    git pull origin claude/workout-planner-app-013kA8V9MD5VBUb7SYSb2NBx
else
    echo "Clonage du repository..."
    git clone -b claude/workout-planner-app-013kA8V9MD5VBUb7SYSb2NBx \
        http://local_proxy@127.0.0.1:18797/git/wilf974/mysport .
fi

echo -e "${GREEN}✅ Code récupéré${NC}\n"

# Installation des dépendances
echo -e "${YELLOW}📦 Étape 4: Installation des dépendances npm...${NC}"

cd $APP_DIR/server
npm install
npm run seed

cd $APP_DIR/client
npm install
npm run build

echo -e "${GREEN}✅ Dépendances installées et build effectué${NC}\n"

# Créer les fichiers d'environnement
echo -e "${YELLOW}⚙️  Étape 5: Configuration des variables d'environnement...${NC}"

cat > $APP_DIR/server/.env << EOF
PORT=5000
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
DATABASE_URL=./mysport.db
ALLOWED_ORIGINS=https://$DOMAIN
EOF

cat > $APP_DIR/client/.env.production << EOF
REACT_APP_API_URL=https://$DOMAIN/api
EOF

echo -e "${GREEN}✅ Variables d'environnement configurées${NC}\n"

# Configuration Nginx
echo -e "${YELLOW}🔧 Étape 6: Configuration de Nginx...${NC}"

cat > /etc/nginx/sites-available/$APP_NAME << 'EOF'
upstream backend {
    server 127.0.0.1:5000;
}

upstream frontend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name mysport.woutils.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mysport.woutils.com;

    # SSL Configuration (will be set by certbot)
    # ssl_certificate /etc/letsencrypt/live/mysport.woutils.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/mysport.woutils.com/privkey.pem;

    # SSL Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/javascript application/json;
    gzip_min_length 1000;
    gzip_comp_level 6;

    # Static files from client build
    location / {
        root /opt/apps/mysport/client/build;
        try_files $uri /index.html;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # API routes to backend
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts pour les uploads de photos
        proxy_read_timeout 30s;
        proxy_connect_timeout 10s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/$APP_NAME

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

echo -e "${GREEN}✅ Nginx configuré${NC}\n"

# Créer les services systemd
echo -e "${YELLOW}🚀 Étape 7: Création des services systemd...${NC}"

cat > /etc/systemd/system/mysport-backend.service << EOF
[Unit]
Description=MySport Backend API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR/server
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/mysport-frontend.service << EOF
[Unit]
Description=MySport Frontend Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR/client
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment="PORT=3000"

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
systemctl daemon-reload
systemctl enable mysport-backend.service
systemctl enable mysport-frontend.service

echo -e "${GREEN}✅ Services systemd créés${NC}\n"

# Arrêter les anciens services s'ils existent
systemctl stop mysport-backend.service || true
systemctl stop mysport-frontend.service || true

sleep 2

# Démarrer les services
echo -e "${YELLOW}🔄 Étape 8: Démarrage des services...${NC}"
systemctl start mysport-backend.service
systemctl start mysport-frontend.service

sleep 3

# Vérifier si les services tournent
if systemctl is-active --quiet mysport-backend.service; then
    echo -e "${GREEN}✅ Backend démarré avec succès${NC}"
else
    echo -e "${RED}❌ Erreur au démarrage du backend${NC}"
    systemctl status mysport-backend.service
fi

if systemctl is-active --quiet mysport-frontend.service; then
    echo -e "${GREEN}✅ Frontend démarré avec succès${NC}"
else
    echo -e "${RED}❌ Erreur au démarrage du frontend${NC}"
    systemctl status mysport-frontend.service
fi

echo ""

# Configuration SSL
echo -e "${YELLOW}🔒 Étape 9: Configuration SSL avec Let's Encrypt...${NC}"

# Arrêter temporairement Nginx pour certbot
systemctl stop nginx

# Obtenir le certificat
certbot certonly --standalone -d mysport.woutils.com -n --agree-tos -m admin@woutils.com

# Redémarrer Nginx
systemctl start nginx

echo -e "${GREEN}✅ Certificat SSL installé${NC}\n"

# Finaliser la configuration Nginx
echo -e "${YELLOW}⚙️  Étape 10: Finalisation de Nginx...${NC}"

# Le certificat est maintenant en place, uncomment les lignes SSL
sed -i 's|# ssl_certificate|ssl_certificate|g' /etc/nginx/sites-available/$APP_NAME
sed -i 's|# ssl_certificate_key|ssl_certificate_key|g' /etc/nginx/sites-available/$APP_NAME

# Test et reload
nginx -t
systemctl reload nginx

echo -e "${GREEN}✅ Nginx configuré avec SSL${NC}\n"

# Afficher le résumé
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}✅ Déploiement réussi!${NC}"
echo -e "${BLUE}================================${NC}\n"

echo -e "${YELLOW}📋 Informations de déploiement:${NC}"
echo -e "  Application URL: ${GREEN}https://mysport.woutils.com${NC}"
echo -e "  API URL: ${GREEN}https://mysport.woutils.com/api${NC}"
echo -e "  Répertoire app: ${GREEN}$APP_DIR${NC}"
echo -e "  Backend port: ${GREEN}5000${NC}"
echo -e "  Frontend port: ${GREEN}3000${NC}\n"

echo -e "${YELLOW}🔧 Commandes utiles:${NC}"
echo -e "  Voir logs backend: ${BLUE}journalctl -u mysport-backend.service -f${NC}"
echo -e "  Voir logs frontend: ${BLUE}journalctl -u mysport-frontend.service -f${NC}"
echo -e "  Redémarrer backend: ${BLUE}systemctl restart mysport-backend.service${NC}"
echo -e "  Redémarrer frontend: ${BLUE}systemctl restart mysport-frontend.service${NC}"
echo -e "  Vérifier SSL: ${BLUE}certbot renew --dry-run${NC}\n"

echo -e "${YELLOW}🔐 Certificat SSL:${NC}"
echo -e "  Chemin: ${GREEN}/etc/letsencrypt/live/mysport.woutils.com/${NC}"
echo -e "  Renouvellement automatique: ${GREEN}Activé${NC}\n"

echo -e "${GREEN}🎉 Votre application est maintenant en ligne!${NC}"
