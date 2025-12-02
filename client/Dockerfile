# Étape 1: Build
FROM node:20-alpine as builder

WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier les fichiers source
COPY public ./public
COPY src ./src

# Variables de build
ARG REACT_APP_API_URL=https://mysport.woutils.com/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build l'application
RUN npm run build

# Étape 2: Servir avec Nginx
FROM nginx:alpine

# Copier la configuration nginx personnalisée
COPY nginx-client.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers build
COPY --from=builder /app/build /usr/share/nginx/html

# Exposer le port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
