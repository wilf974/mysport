# 📋 MySport - Améliorations à mettre en place

## 🔵 1. Fonctions liées à l'entraînement (les plus utiles)

### 1.1 Suivi intelligent des performances
- [ ] Graphiques automatiques de progression (charges, reps, RPE)
- [ ] Courbes par exercice (développé couché, squat, tractions…)
- [ ] Indication visuelle : "+6 % / semaine", "stagnation", etc.
- **Technologie suggérée**: Chart.js ou Recharts pour les graphiques

### 1.2 Détection de stagnation
- [ ] Si l'utilisateur n'augmente plus ses poids sur 2–3 séances
- [ ] Message automatique : "Il est temps d'ajouter +2,5 kg ou d'augmenter les répétitions."
- [ ] Système de notifications pour alerter l'utilisateur
- **Logique**: Comparer les poids des 3 dernières séances du même exercice

### 1.3 Progression automatique du programme
- [ ] +2,5 kg toutes les 2 semaines
- [ ] +1 répétition / semaine si la charge est déjà lourde
- [ ] Détection RPE pour ajuster automatiquement
- [ ] Interface pour accepter/refuser les suggestions de progression
- **Champs à ajouter à la BD**: RPE (Rate of Perceived Exertion)

### 1.4 Timer intégré par exercice
- [ ] Temps de repos personnalisable
- [ ] Mode "chrono global" de la séance
- [ ] Historique du temps total de séance
- [ ] Notifications quand le repos est terminé
- **Composant**: Créer un composant WorkoutTimer réutilisable

### 1.5 Comparateur de séances
- [ ] Montrer meilleure séance sur le même programme
- [ ] Charge totale soulevée
- [ ] Volume par muscle
- [ ] Statistiques comparatives
- **API endpoint**: Créer /api/workout-comparison/:userId/:exerciseId

---

## 🟢 2. Fonctions liées à la nutrition

### 2.1 Objectif calories & macros automatiquement calculé
- [ ] Basé sur : poids, taille, objectif (perte/prise/maintien), activité
- [ ] Formule Harris-Benedict ou Mifflin-St Jeor pour TDEE
- [ ] Interface de configuration dans les paramètres utilisateur
- [ ] Stockage des préférences dans la BD
- **Nouvelle table BD**: `nutrition_goals` (user_id, tdee, proteins, carbs, fats, objective)

### 2.2 Journal alimentaire simplifié
- [ ] Pas besoin d'énorme base de données
- [ ] Ajouter juste "protéines / glucides / lipides / calories"
- [ ] Enregistrer des repas favoris
- [ ] Système de suggestion automatique
- [ ] Exemple : "Tu manques de protéines aujourd'hui."
- **Nouvelles tables BD**: `meals`, `favorite_meals`

### 2.3 Rappel hydratation et repas
- [ ] "Bois 300 ml maintenant"
- [ ] "Il manque 40 g de protéines à ton objectif du jour"
- [ ] Notifications programmables
- [ ] Historique d'hydratation
- **Nouvelle table BD**: `hydration_log`

### 2.4 Tracking du jeûne intermittent
- [ ] Affichage : temps de jeûne, fenêtre alimentaire
- [ ] Jours complétés (très motivant)
- [ ] Paramètres : heure début, heure fin
- [ ] Statistiques mensuelles
- **Nouvelle table BD**: `intermittent_fasting` (user_id, start_time, end_time, date)

---

## 🔴 3. Fonctions liées au suivi physique

### 3.1 Historique photos avant/après automatique
- [ ] Mise en page automatique
- [ ] Comparaison côte à côte
- [ ] Détection : "Bras +0,7 cm / Ventre -1,2 cm"
- [ ] Galerie avec timeline
- [ ] Zoom et comparaison
- **Amélioration UI**: Créer PhotoComparison.js avec 2 images côte à côte

### 3.2 Mesure des circonférences
- [ ] Bras
- [ ] Épaules
- [ ] Tour de taille
- [ ] Cuisses
- [ ] Graphiques comme pour les performances
- [ ] Tendances visuelles
- **Amélioration**: Étendre body_measurements existante avec graphiques

### 3.3 Indicateur de recomposition corporelle
- [ ] Score Muscle +0.4
- [ ] Score Gras -0.3
- [ ] Basé sur poids + mesures + performances
- [ ] Plus fiable que l'IMC
- [ ] Algorithme pour calculer le score
- **Nouvelle table BD**: `body_composition_score`

### 3.4 Estimation de la TDEE réelle
- [ ] Adaptée automatiquement selon : activité, sommeil, poids, intensité
- [ ] Mise à jour basée sur les données d'entraînement
- [ ] Historique des TDEE estimées
- [ ] Graphique de correction automatique
- **Nouvelle table BD**: `tdee_history`

---

## 🟠 4. Fonctionnalités motivation / psychologie

### 4.1 Calendrier d'assiduité (système de "streak")
- [ ] Parfait pour garder une habitude
- [ ] Compter les jours consécutifs d'entraînement
- [ ] Si l'utilisateur manque 2 séances → message : "Tu vas perdre ta lancée, reprends demain !"
- [ ] Affichage du meilleur streak
- [ ] Animation visuelle des jours complétés
- **Nouvelle table BD**: `training_streak`

### 4.2 Score quotidien "Forme & Récupération"
- [ ] Basé sur : sommeil, énergie perçue, humeur, intensité de la séance
- [ ] Notation 1-10 avant chaque séance
- [ ] Historique et tendances
- [ ] Conseil basé sur le score (repos si bas)
- **Nouvelle table BD**: `recovery_score`

### 4.3 Objectifs mensuels
- [ ] Exemples : "+10 kg au squat", "Perdre 1 cm de tour de taille"
- [ ] "Faire 10 tractions assistées avec moins d'aide"
- [ ] Suivi automatique de la progression
- [ ] Interface CRUD pour créer/modifier objectifs
- [ ] Notifications de progression
- **Nouvelle table BD**: `monthly_goals`

### 4.4 Système de notifications personnalisées
- [ ] "Tu t'entraînes dans 1h. Pense à t'hydrater."
- [ ] "Tu n'as pas ajouté une séance depuis 4 jours."
- [ ] "Hier, tu as battu ton record sur le développé couché."
- [ ] Préférences utilisateur pour activer/désactiver
- [ ] Horaires personnalisables
- **Nouvelle table BD**: `notifications_preferences`

---

## 🟣 5. Bonus (si tu veux aller plus loin)

### 5.1 Mode coach IA intégré ⭐
- [ ] L'IA ajuste : le programme, les charges, les répétitions, les calories
- [ ] Basé sur les données entrées par l'utilisateur
- [ ] Intégration API (OpenAI, Anthropic, etc.)
- [ ] Historique des recommandations
- [ ] Feedback utilisateur sur les suggestions
- **Complexité**: Haute - Nécessite backend IA
- **Coût**: API payante

### 5.2 "Mode minimaliste" ⭐
- [ ] Pour les gens qui veulent aller vite
- [ ] Choix 3 exercices
- [ ] Séance en 25 minutes
- [ ] Guidée automatiquement
- [ ] Interface simplifiée sans stats
- **Composant**: QuickWorkout.js avec interface minimaliste

### 5.3 Analyse vidéo des mouvements ⭐
- [ ] Prendre une vidéo de squat ou développé couché
- [ ] Feedback simple : "Descente trop rapide", "Genoux rentrent", "Amplitude insuffisante"
- [ ] Intégration ML (TensorFlow.js pour pose detection)
- [ ] Historique des analyses
- **Complexité**: Très haute - ML/Computer Vision
- **Alternative**: Vidéo + feedback manuel d'un coach

---

## 📊 Résumé par priorité

### 🚀 Haute priorité (+ valeur pour l'utilisateur)
1. Graphiques de progression (1.1)
2. Détection de stagnation (1.2)
3. Timer intégré (1.4)
4. Journal alimentaire (2.2)
5. Comparaison de séances (1.5)
6. Streak d'assiduité (4.1)

### 📈 Priorité moyenne
1. Progression automatique (1.3)
2. Calcul macros/calories (2.1)
3. Mesure circonférences (3.2)
4. Score récupération (4.2)
5. Objectifs mensuels (4.3)

### 💡 Basse priorité (Nice-to-have)
1. Rappels hydratation (2.3)
2. Jeûne intermittent (2.4)
3. Recomposition corporelle (3.3)
4. TDEE réelle (3.4)
5. Notifications (4.4)
6. Coach IA (5.1)
7. Mode minimaliste (5.2)
8. Analyse vidéo (5.3)

---

## 🛠️ Stack technologique proposé

### Backend
- **Graphiques**: Données JSON depuis Express (Chart.js côté front)
- **IA**: Intégration API (OpenAI pour recommandations)
- **ML**: TensorFlow.js (si analyse vidéo)
- **Notifications**: Service web push ou emails

### Frontend
- **Graphiques**: Chart.js ou Recharts
- **Vidéo**: MediaRecorder API native
- **Notifications**: Service Workers (PWA)
- **ML**: TensorFlow.js pour pose detection

### Database (SQLite)
- 15+ nouvelles tables pour nouvelles fonctionnalités
- Migrations versionnées

---

## 📝 Notes importantes

- ✅ = Fonctionnalité validée par l'utilisateur
- 🚀 = À commencer en priorité
- Les numéros de sections correspondent aux sections du document
- Chaque fonctionnalité inclut les tables BD nécessaires
- Les estimations de complexité aident à la planification

---

**Dernière mise à jour**: 2 décembre 2025
**Version de l'app**: 1.0 (Feature: photo-to-workout association)
