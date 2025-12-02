# 💪 MySport - Application Complète de Musculation

Une application web moderne et complète pour gérer vos entraînements de musculation, suivre votre progression et atteindre vos objectifs fitness.

## ✨ Fonctionnalités

### 📅 **Planning Hebdomadaire**
- Calendrier interactif de la semaine
- Planification des entraînements par jour
- Navigation entre les semaines
- Aperçu des exercices du jour

### 💪 **Gestion des Exercices**
- Création, modification, suppression d'exercices
- Classification par groupe musculaire (poitrine, dos, jambes, etc.)
- 3 niveaux de difficulté (débutant, intermédiaire, avancé)
- Recherche et filtrage par groupe musculaire
- Descriptions détaillées

### 📋 **Entraînements Personnalisés**
- Ajouter plusieurs exercices par jour
- Définir séries, répétitions et poids
- Notes et commentaires sur chaque exercice
- Marquer les exercices comme complétés
- Modification facile

### 📸 **Suivi par Photos**
- Téléchargement de photos de progression
- Identification de la zone musculaire
- Poids et observations au moment de la photo
- Comparaisons avant/après visuelles
- Historique complet

### 📏 **Mesures Corporelles**
- Suivi de 11 mesures (cou, épaules, poitrine, taille, hanches, biceps, avant-bras, cuisses, mollets, poids, graisse corporelle)
- Historique complet des mesures
- Différences par rapport à la dernière mesure
- Tableau récapitulatif

### 📊 **Statistiques et Progression**
- Total d'entraînements effectués
- Records personnels (PRs)
- Visualisation des meilleures performances
- Conseils pour la progression

### 💾 **Base de Données Complète**
- Stockage sécurisé de toutes les données
- Gestion des photos en base64
- Historique détaillé
- Synchronisation en temps réel

## 🚀 Installation et Lancement

### Prérequis
- Node.js (v14 ou supérieur)
- npm ou yarn

### Installation

1. **Cloner le repository**
```bash
git clone <repository-url>
cd mysport
```

2. **Installation des dépendances du serveur**
```bash
cd server
npm install
```

3. **Installation des dépendances du client**
```bash
cd ../client
npm install
```

### Lancement

#### Terminal 1 - Serveur Backend
```bash
cd server
npm start
```
Le serveur démarre sur `http://localhost:5000`

#### Terminal 2 - Client Frontend
```bash
cd client
npm start
```
L'application s'ouvre sur `http://localhost:3000`

## 📁 Structure du Projet

```
mysport/
├── server/
│   ├── database.js          # Schéma et initialisation SQLite
│   ├── server.js            # API REST complète
│   ├── .env                 # Configuration
│   ├── package.json
│   └── node_modules/
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── App.js           # Composant principal
│   │   ├── App.css
│   │   └── components/
│   │       ├── Header.js
│   │       ├── WorkoutCalendar.js
│   │       ├── WorkoutModal.js
│   │       ├── ExerciseList.js
│   │       ├── ProgressPhotos.js
│   │       ├── BodyMeasurements.js
│   │       ├── Statistics.js
│   │       └── *.css
│   ├── package.json
│   └── node_modules/
├── .gitignore
└── README.md
```

## 🔌 API Endpoints

### Exercices
- `GET /api/exercises/:userId` - Récupérer tous les exercices
- `POST /api/exercises` - Créer un exercice
- `PUT /api/exercises/:id` - Modifier un exercice
- `DELETE /api/exercises/:id` - Supprimer un exercice

### Entraînements
- `GET /api/workouts/:userId/:week/:year` - Récupérer les entraînements de la semaine
- `POST /api/workouts` - Créer un entraînement
- `DELETE /api/workouts/:id` - Supprimer un entraînement

### Exercices d'Entraînement
- `GET /api/workout-exercises/:workoutId` - Lister les exercices d'un entraînement
- `POST /api/workout-exercises` - Ajouter un exercice à un entraînement
- `PUT /api/workout-exercises/:id` - Modifier un exercice d'entraînement
- `DELETE /api/workout-exercises/:id` - Retirer un exercice

### Photos de Progression
- `GET /api/progress-photos/:userId` - Récupérer les photos
- `GET /api/progress-photos/:userId/:photoId` - Récupérer une photo
- `POST /api/progress-photos` - Ajouter une photo
- `DELETE /api/progress-photos/:id` - Supprimer une photo

### Mesures Corporelles
- `GET /api/measurements/:userId` - Récupérer les mesures
- `POST /api/measurements` - Ajouter des mesures

### Statistiques
- `GET /api/stats/:userId` - Récupérer les statistiques

## 🎨 Design et UX

- **Interface moderne** avec dégradés et animations fluides
- **Responsive design** - Fonctionne sur mobile, tablette et desktop
- **Navigation intuitive** avec onglets clairs
- **Feedback utilisateur** avec messages d'erreur et confirmations
- **Couleurs attrayantes** : Rouge (#ff6b6b) et Cyan (#4ecdc4)

## 🔐 Sécurité

- Données stockées localement en SQLite
- Pas d'authentification requise pour la démo (adapter selon vos besoins)
- Validation des entrées
- Protection contre les injections SQL avec paramètres

## 📱 Fonctionnalités Bonus

- Calcul automatique des différences de mesures
- Affichage du poids et notes dans les photos
- Marquage des exercices comme complétés
- Conseils de progression
- Interface bilingue prête (FR/EN)

## 🚀 Améliorations Futures

- [ ] Authentification utilisateur
- [ ] Synchronisation cloud
- [ ] Graphiques de progression avancés
- [ ] Export PDF/CSV
- [ ] Application mobile native
- [ ] Notifications et rappels
- [ ] Mode hors ligne
- [ ] Intégration avec fitness trackers

## 📝 Notes

- La démo utilise l'utilisateur ID `1`
- Les photos sont stockées en base64
- Les mesures sont en cm et kg
- La semaine commence le lundi

## 📞 Support

Pour toute question ou bug report, veuillez ouvrir une issue.

## 📄 Licence

MIT License
