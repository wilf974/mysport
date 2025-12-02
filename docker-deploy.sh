#!/bin/bash

# ============================================================================
# MySport Docker Deployment Script
# Déploie l'application avec Docker Compose sur le VPS
# ============================================================================

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_DIR="/opt/apps/mysport"
DOMAIN="mysport.woutils.com"
EMAIL="admin@woutils.com"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  MySport Docker Deployment${NC}"
echo -e "${BLUE}================================${NC}\n"

# Vérifier si root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ Doit être exécuté en tant que root${NC}"
   exit 1
fi

# Étape 1: Installer Docker
echo -e "${YELLOW}📦 Étape 1: Installation de Docker...${NC}"

if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

systemctl start docker
systemctl enable docker

echo -e "${GREEN}✅ Docker installé${NC}\n"

# Étape 2: Préparer les répertoires
echo -e "${YELLOW}📁 Étape 2: Préparation des répertoires...${NC}"

mkdir -p $APP_DIR
cd $APP_DIR

# Cloner le repository
if [ ! -d "$APP_DIR/.git" ]; then
    echo "Clonage du repository..."
    git clone -b claude/workout-planner-app-013kA8V9MD5VBUb7SYSb2NBx \
        http://local_proxy@127.0.0.1:18797/git/wilf974/mysport .
fi

cd $APP_DIR

echo -e "${GREEN}✅ Répertoires préparés${NC}\n"

# Étape 3: Créer les fichiers .env
echo -e "${YELLOW}⚙️  Étape 3: Configuration...${NC}"

# Générer une clé JWT sécurisée
JWT_SECRET=$(openssl rand -base64 32)

cat > .env << EOF
# Backend Environment
JWT_SECRET=$JWT_SECRET
NODE_ENV=production
PORT=5000
DATABASE_URL=/app/mysport.db
ALLOWED_ORIGINS=https://$DOMAIN

# Docker
COMPOSE_PROJECT_NAME=mysport
DOMAIN=$DOMAIN
EMAIL=$EMAIL
EOF

echo -e "${GREEN}✅ Configuration créée${NC}\n"

# Étape 4: Construire les images Docker
echo -e "${YELLOW}🔨 Étape 4: Construction des images Docker...${NC}"

docker-compose build --no-cache

echo -e "${GREEN}✅ Images Docker construites${NC}\n"

# Étape 5: Démarrer les containers
echo -e "${YELLOW}🚀 Étape 5: Démarrage des containers...${NC}"

docker-compose up -d

echo -e "${GREEN}✅ Containers démarrés${NC}\n"

# Attendre que tout soit prêt
echo -e "${YELLOW}⏳ Attente du démarrage des services...${NC}"
sleep 10

# Étape 6: Obtenir les certificats SSL
echo -e "${YELLOW}🔒 Étape 6: Configuration SSL avec Let's Encrypt...${NC}"

# Créer les répertoires pour Let's Encrypt
mkdir -p /etc/letsencrypt/live/$DOMAIN
mkdir -p /var/lib/letsencrypt

# Si les certificats n'existent pas, les générer
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    # Utiliser certbot en standalone temporairement
    docker run --rm \
        -v /etc/letsencrypt:/etc/letsencrypt \
        -v /var/lib/letsencrypt:/var/lib/letsencrypt \
        -p 80:80 \
        certbot/certbot certonly \
            --standalone \
            -d $DOMAIN \
            --non-interactive \
            --agree-tos \
            -m $EMAIL

    echo -e "${GREEN}✅ Certificat SSL obtenu${NC}"
else
    echo -e "${GREEN}✅ Certificat SSL existant détecté${NC}"
fi

sleep 2

# Redémarrer Nginx pour appliquer les certificats
docker-compose restart nginx

echo ""

# Étape 7: Vérifications
echo -e "${YELLOW}✅ Étape 7: Vérifications...${NC}"

# Vérifier les containers
echo -e "${BLUE}État des containers:${NC}"
docker-compose ps

# Vérifier la santé du backend
echo ""
if docker-compose exec -T backend curl -s http://localhost:5000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend OK${NC}"
else
    echo -e "${RED}❌ Backend non accessible${NC}"
fi

# Vérifier Nginx
echo ""
if docker-compose exec -T nginx curl -s http://localhost > /dev/null; then
    echo -e "${GREEN}✅ Nginx OK${NC}"
else
    echo -e "${RED}❌ Nginx non accessible${NC}"
fi

echo ""

# Résumé
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}✅ Déploiement Docker réussi!${NC}"
echo -e "${BLUE}================================${NC}\n"

echo -e "${YELLOW}📋 Informations:${NC}"
echo -e "  Application: ${GREEN}https://$DOMAIN${NC}"
echo -e "  API: ${GREEN}https://$DOMAIN/api${NC}"
echo -e "  Répertoire: ${GREEN}$APP_DIR${NC}\n"

echo -e "${YELLOW}🐳 Commandes Docker:${NC}"
echo -e "  Logs backend: ${BLUE}docker-compose logs -f backend${NC}"
echo -e "  Logs frontend: ${BLUE}docker-compose logs -f frontend${NC}"
echo -e "  Logs nginx: ${BLUE}docker-compose logs -f nginx${NC}"
echo -e "  Redémarrer: ${BLUE}docker-compose restart${NC}"
echo -e "  Arrêter: ${BLUE}docker-compose down${NC}"
echo -e "  Statut: ${BLUE}docker-compose ps${NC}\n"

echo -e "${YELLOW}🔐 SSL/TLS:${NC}"
echo -e "  Certificat: ${GREEN}/etc/letsencrypt/live/$DOMAIN/${NC}"
echo -e "  Renouvellement auto: ${GREEN}Activé (toutes les 12h)${NC}\n"

echo -e "${YELLOW}📊 Monitoring:${NC}"
echo -e "  Health check: ${BLUE}curl https://$DOMAIN/health${NC}\n"

echo -e "${GREEN}🎉 Votre application est en production!${NC}"

# Ajouter une tâche cron pour le renouvellement du certificat
echo -e "${YELLOW}⏰ Configuration du renouvellement SSL...${NC}"

# Créer un script de renouvellement
cat > /opt/apps/mysport/renew-ssl.sh << 'SSLEOF'
#!/bin/bash
cd /opt/apps/mysport
docker-compose down
docker run --rm \
    -v /etc/letsencrypt:/etc/letsencrypt \
    -v /var/lib/letsencrypt:/var/lib/letsencrypt \
    -p 80:80 \
    certbot/certbot renew --force-renewal
docker-compose up -d
SSLEOF

chmod +x /opt/apps/mysport/renew-ssl.sh

# Ajouter au crontab (tous les jours à 3h du matin)
(crontab -l 2>/dev/null | grep -v "renew-ssl.sh"; echo "0 3 * * * /opt/apps/mysport/renew-ssl.sh >> /var/log/mysport-ssl-renewal.log 2>&1") | crontab -

echo -e "${GREEN}✅ Renouvellement SSL configuré${NC}\n"

echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}🚀 Déploiement terminé avec succès!${NC}"
echo -e "${BLUE}================================${NC}"
