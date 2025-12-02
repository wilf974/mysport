# 🚀 Guide de Déploiement MySport sur VPS

Guide complet pour déployer MySport sur votre VPS avec Docker Compose et HTTPS.

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Configuration DNS](#configuration-dns)
3. [Installation Rapide](#installation-rapide)
4. [Installation Manuelle](#installation-manuelle)
5. [Vérification et Tests](#vérification-et-tests)
6. [Maintenance](#maintenance)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Prérequis

### VPS Requirements
- **OS**: Ubuntu 20.04+ ou Debian 11+
- **RAM**: Minimum 2 GB (recommandé 4 GB)
- **Stockage**: Minimum 20 GB (recommandé 50 GB+)
- **CPU**: 2 cores minimum
- **Port**: 80 et 443 doivent être disponibles

### Logiciels requis
- Docker & Docker Compose
- Git
- Certbot (pour SSL/TLS)

---

## 🌐 Configuration DNS

Assurez-vous que votre DNS pointe vers votre VPS:

```
A    mysport    0    168.231.84.168    300
```

**Vérification du DNS:**
```bash
nslookup mysport.woutils.com
dig mysport.woutils.com
```

Attendez 15-30 minutes pour la propagation DNS mondiale.

---

## 🚀 Installation Rapide (Recommandé)

### 1. Se connecter au VPS

```bash
ssh root@168.231.84.168
```

### 2. Cloner le repository et déployer

```bash
cd /tmp
git clone -b claude/workout-planner-app-013kA8V9MD5VBUb7SYSb2NBx \
    http://local_proxy@127.0.0.1:18797/git/wilf974/mysport mysport-deploy

cd mysport-deploy

# Rendre le script exécutable
chmod +x docker-deploy.sh

# Lancer le déploiement
sudo ./docker-deploy.sh
```

Le script fera:
- ✅ Installer Docker & Docker Compose
- ✅ Cloner le repository dans `/opt/apps/mysport`
- ✅ Construire les images Docker
- ✅ Démarrer les containers
- ✅ Configurer SSL/TLS avec Let's Encrypt
- ✅ Configurer Nginx comme reverse proxy

**Temps estimé: 10-15 minutes**

---

## 📝 Installation Manuelle

Si vous préférez faire étape par étape:

### Étape 1: Installer Docker

```bash
# Télécharger et installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier les installations
docker --version
docker-compose --version
```

### Étape 2: Cloner le repository

```bash
mkdir -p /opt/apps
cd /opt/apps
git clone -b claude/workout-planner-app-013kA8V9MD5VBUb7SYSb2NBx \
    http://local_proxy@127.0.0.1:18797/git/wilf974/mysport mysport

cd mysport
```

### Étape 3: Créer le fichier .env

```bash
cat > .env << EOF
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
PORT=5000
DATABASE_URL=/app/mysport.db
ALLOWED_ORIGINS=https://mysport.woutils.com
COMPOSE_PROJECT_NAME=mysport
DOMAIN=mysport.woutils.com
EMAIL=admin@woutils.com
EOF
```

### Étape 4: Construire et démarrer

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Étape 5: Obtenir le certificat SSL

```bash
# Créer les répertoires
mkdir -p /etc/letsencrypt/live/mysport.woutils.com
mkdir -p /var/lib/letsencrypt

# Générer le certificat
docker run --rm \
    -v /etc/letsencrypt:/etc/letsencrypt \
    -v /var/lib/letsencrypt:/var/lib/letsencrypt \
    -p 80:80 \
    certbot/certbot certonly \
        --standalone \
        -d mysport.woutils.com \
        --non-interactive \
        --agree-tos \
        -m admin@woutils.com

# Redémarrer Nginx pour appliquer le certificat
docker-compose restart nginx
```

### Étape 6: Configurer le renouvellement SSL

```bash
# Créer le script de renouvellement
cat > /opt/apps/mysport/renew-ssl.sh << 'EOF'
#!/bin/bash
cd /opt/apps/mysport
docker-compose down
docker run --rm \
    -v /etc/letsencrypt:/etc/letsencrypt \
    -v /var/lib/letsencrypt:/var/lib/letsencrypt \
    -p 80:80 \
    certbot/certbot renew --force-renewal
docker-compose up -d
EOF

chmod +x /opt/apps/mysport/renew-ssl.sh

# Ajouter au crontab
(crontab -l 2>/dev/null | grep -v "renew-ssl.sh"; \
echo "0 3 * * * /opt/apps/mysport/renew-ssl.sh >> /var/log/mysport-ssl-renewal.log 2>&1") | crontab -
```

---

## ✅ Vérification et Tests

### Vérifier les containers

```bash
cd /opt/apps/mysport
docker-compose ps

# Devrait afficher:
# NAME                    STATUS          PORTS
# mysport-backend         Up (healthy)    5000/tcp
# mysport-frontend        Up (healthy)    3000/tcp
# mysport-nginx           Up (healthy)    0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

### Tester l'application

```bash
# Frontend
curl -I https://mysport.woutils.com/
# Devrait retourner 200 OK

# Backend API
curl -I https://mysport.woutils.com/api/exercises/1
# Devrait retourner 200 OK

# Health check
curl https://mysport.woutils.com/health
# Devrait retourner "healthy"
```

### Consulter les logs

```bash
# Logs backend
docker-compose logs -f backend

# Logs frontend
docker-compose logs -f frontend

# Logs Nginx
docker-compose logs -f nginx

# Tous les logs
docker-compose logs -f
```

### Vérifier le certificat SSL

```bash
# Voir l'expiration du certificat
certbot certificates

# Ou via curl
curl -vI https://mysport.woutils.com/ 2>&1 | grep "subject="
```

---

## 🔧 Maintenance

### Arrêter l'application

```bash
cd /opt/apps/mysport
docker-compose down
```

### Redémarrer l'application

```bash
cd /opt/apps/mysport
docker-compose restart
```

### Mettre à jour le code

```bash
cd /opt/apps/mysport
git pull origin claude/workout-planner-app-013kA8V9MD5VBUb7SYSb2NBx
docker-compose build --no-cache
docker-compose up -d
```

### Augmenter la limite d'upload

Éditer `docker-compose.yml`:

```yaml
environment:
  - CLIENT_MAX_BODY_SIZE=100M  # Par défaut 50M
```

Puis redémarrer:
```bash
docker-compose restart
```

### Sauvegarder la base de données

```bash
# Copier la base de données
cp /opt/apps/mysport/server/mysport.db ~/mysport-backup-$(date +%Y%m%d).db

# Ou avec Docker
docker-compose exec -T backend cp /app/mysport.db /tmp/backup.db
docker cp mysport-backend:/tmp/backup.db ~/mysport-backup-$(date +%Y%m%d).db
```

### Restaurer la base de données

```bash
cp ~/mysport-backup-20231215.db /opt/apps/mysport/server/mysport.db
docker-compose restart backend
```

---

## 🐛 Troubleshooting

### Les containers ne démarrent pas

```bash
# Vérifier les logs
docker-compose logs

# Vérifier l'espace disque
df -h

# Vérifier les ports disponibles
netstat -tulpn | grep -E ':(80|443|5000|3000)'

# Redémarrer Docker
sudo systemctl restart docker
```

### SSL/TLS ne fonctionne pas

```bash
# Vérifier le certificat
ls -la /etc/letsencrypt/live/mysport.woutils.com/

# Vérifier les permissions
sudo chown -R root:root /etc/letsencrypt
sudo chmod -R 755 /etc/letsencrypt

# Redémarrer Nginx
docker-compose restart nginx
```

### DNS ne résout pas

```bash
# Vérifier le DNS
dig mysport.woutils.com
nslookup mysport.woutils.com

# Attendre la propagation (15-30 min)
# Ou vider le cache DNS (Linux)
sudo systemctl restart systemd-resolved
```

### Backend refuse les connexions

```bash
# Vérifier le port 5000
netstat -tulpn | grep 5000

# Vérifier la base de données
docker-compose exec backend ls -la /app/mysport.db

# Redémarrer le backend
docker-compose restart backend

# Voir les logs
docker-compose logs backend
```

### Frontend affiche une erreur 404

```bash
# Vérifier que le build est complet
docker-compose logs frontend

# Reconstruire le frontend
docker-compose build --no-cache frontend
docker-compose restart frontend
```

### Certificat SSL expiré

```bash
# Renouveler manuellement
/opt/apps/mysport/renew-ssl.sh

# Ou avec certbot
sudo certbot renew --force-renewal

# Redémarrer Nginx
docker-compose restart nginx
```

---

## 📊 Performance et Optimisation

### Monitorer l'utilisation ressources

```bash
# Utilisation CPU/RAM des containers
docker stats

# Espace disque
df -h

# Processus actifs
top
```

### Nettoyer les images non utilisées

```bash
# Supprimer les images non utilisées
docker image prune -a

# Supprimer les volumes non utilisés
docker volume prune

# Supprimer les networks non utilisés
docker network prune
```

### Augmenter la limite de fichiers ouvertes

```bash
# Éditer /etc/security/limits.conf
sudo cat >> /etc/security/limits.conf << EOF
*       soft    nofile  65535
*       hard    nofile  65535
EOF

# Appliquer
sudo sysctl -p
```

---

## 🔒 Sécurité

### Configurer un firewall

```bash
# UFW (Ubuntu)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable

# Fail2ban pour brute force
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

### Changer le secret JWT

Éditer `.env`:
```bash
JWT_SECRET=$(openssl rand -base64 32)
```

Redémarrer:
```bash
docker-compose restart backend
```

### Activer les logs de sécurité

```bash
# Vérifier les tentatives d'accès non autorisées
tail -f /var/log/auth.log

# Vérifier les erreurs Nginx
docker-compose logs nginx | grep error
```

---

## 📞 Support

Pour des problèmes, consultez:

1. **Logs de l'application**
   ```bash
   docker-compose logs -f
   ```

2. **Documentation Docker**
   https://docs.docker.com

3. **Documentation Nginx**
   https://nginx.org/en/docs/

4. **Let's Encrypt**
   https://letsencrypt.org/docs/

---

## ✨ Vous êtes prêt!

Votre application MySport est maintenant en production à:

🌐 **https://mysport.woutils.com**

Bon entraînement! 💪
