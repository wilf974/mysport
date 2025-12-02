# Étape 1: Build avec dépendances
FROM node:20-alpine as builder

WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Étape 2: Application finale
FROM node:20-alpine

WORKDIR /app

# Installer curl pour healthcheck
RUN apk add --no-cache curl

# Copier les node_modules du builder
COPY --from=builder /app/node_modules ./node_modules

# Copier les fichiers application
COPY package*.json ./
COPY server.js ./
COPY database.js ./
COPY seed.js ./

# Créer la base de données au démarrage
RUN node seed.js || true

# Exposer le port
EXPOSE 5000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Démarrer l'application
CMD ["npm", "start"]
