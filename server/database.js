const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use DATABASE_URL environment variable if set, otherwise default to ./mysport.db
const dbPath = process.env.DATABASE_URL || path.join(__dirname, 'mysport.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
  } else {
    console.log('Connecté à la base de données SQLite:', dbPath);
    initDatabase();
  }
});

function initDatabase() {
  // Table des utilisateurs
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table des exercices
  db.run(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      muscle_group TEXT,
      difficulty TEXT DEFAULT 'intermediate',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Table des entraînements (semaine)
  db.run(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      day_of_week INTEGER,
      week_number INTEGER,
      year INTEGER,
      duration INTEGER,
      completed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Table de liaison: entraînements et exercices
  db.run(`
    CREATE TABLE IF NOT EXISTS workout_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      sets INTEGER DEFAULT 3,
      reps INTEGER DEFAULT 10,
      weight REAL,
      notes TEXT,
      completed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(workout_id) REFERENCES workouts(id),
      FOREIGN KEY(exercise_id) REFERENCES exercises(id)
    )
  `);

  // Table de progression (poids, volume, etc.)
  db.run(`
    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_exercise_id INTEGER NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      weight REAL,
      sets INTEGER,
      reps INTEGER,
      total_volume REAL,
      notes TEXT,
      FOREIGN KEY(workout_exercise_id) REFERENCES workout_exercises(id)
    )
  `);

  // Table des photos de progression
  db.run(`
    CREATE TABLE IF NOT EXISTS progress_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      workout_id INTEGER,
      photo_data LONGTEXT,
      photo_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      muscle_focus TEXT,
      weight REAL,
      notes TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(workout_id) REFERENCES workouts(id)
    )
  `);

  // Ajouter la colonne workout_id si elle n'existe pas
  db.run(`ALTER TABLE progress_photos ADD COLUMN workout_id INTEGER REFERENCES workouts(id)`, (err) => {
    if (err && err.message.includes('duplicate column')) {
      // La colonne existe déjà
    } else if (err) {
      console.error('Erreur lors de l\'ajout de workout_id:', err);
    }
  });

  // Ajouter la colonne duration si elle n'existe pas
  db.run(`ALTER TABLE workouts ADD COLUMN duration INTEGER`, (err) => {
    if (err && err.message.includes('duplicate column')) {
      // La colonne existe déjà
    } else if (err) {
      console.error('Erreur lors de l\'ajout de duration:', err);
    }
  });

  // Ajouter la colonne RPE si elle n'existe pas
  db.run(`ALTER TABLE workout_exercises ADD COLUMN rpe REAL`, (err) => {
    if (err && err.message.includes('duplicate column')) {
      // La colonne existe déjà
    } else if (err) {
      console.error('Erreur lors de l\'ajout de rpe:', err);
    }
  });

  // Ajouter la colonne exercise_order pour l'ordre des exercices
  db.run(`ALTER TABLE workout_exercises ADD COLUMN exercise_order INTEGER DEFAULT 0`, (err) => {
    if (err && err.message.includes('duplicate column')) {
      // La colonne existe déjà
    } else if (err) {
      console.error('Erreur lors de l\'ajout de exercise_order:', err);
    } else {
      console.log('Colonne exercise_order ajoutée avec succès');
    }
  });

  // Ajouter la colonne completed à workouts si elle n'existe pas
  db.run(`ALTER TABLE workouts ADD COLUMN completed BOOLEAN DEFAULT 0`, (err) => {
    if (err && err.message.includes('duplicate column')) {
      // La colonne existe déjà
      console.log('Colonne completed déjà présente dans workouts');
    } else if (err) {
      console.error('Erreur lors de l\'ajout de completed à workouts:', err);
    } else {
      console.log('Colonne completed ajoutée avec succès à workouts');
    }
  });

  // Table des mesures corporelles
  db.run(`
    CREATE TABLE IF NOT EXISTS body_measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      neck REAL,
      shoulders REAL,
      chest REAL,
      waist REAL,
      hips REAL,
      biceps REAL,
      forearms REAL,
      thighs REAL,
      calves REAL,
      weight REAL,
      body_fat_percentage REAL,
      notes TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Table des repas (Nutrition)
  db.run(`
    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      calories INTEGER,
      protein REAL,
      carbs REAL,
      fats REAL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      type TEXT, -- 'breakfast', 'lunch', 'dinner', 'snack'
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Table des repas favoris
  db.run(`
    CREATE TABLE IF NOT EXISTS favorite_meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      calories INTEGER,
      protein REAL,
      carbs REAL,
      fats REAL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Table des objectifs nutritionnels
  db.run(`
    CREATE TABLE IF NOT EXISTS nutrition_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      calories INTEGER DEFAULT 2000,
      protein INTEGER DEFAULT 150,
      carbs INTEGER DEFAULT 200,
      fats INTEGER DEFAULT 70,
      weight REAL,
      height REAL,
      age INTEGER,
      gender TEXT, -- 'male', 'female'
      activity_level TEXT, -- 'sedentary', 'light', 'moderate', 'active', 'very_active'
      goal TEXT, -- 'cut', 'maintain', 'bulk'
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Table des scores de récupération
  db.run(`
    CREATE TABLE IF NOT EXISTS recovery_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      sleep_score INTEGER, -- 1-10
      energy_score INTEGER, -- 1-10
      mood_score INTEGER, -- 1-10
      soreness_score INTEGER, -- 1-10 (10 = no soreness, 1 = very sore)
      notes TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Table des objectifs mensuels
  db.run(`
    CREATE TABLE IF NOT EXISTS monthly_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      target_value REAL,
      current_value REAL DEFAULT 0,
      unit TEXT, -- 'kg', 'cm', 'rep', 'séance'
      month INTEGER,
      year INTEGER,
      completed BOOLEAN DEFAULT 0,
      category TEXT, -- 'strength', 'physique', 'habit'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Table des jeûnes
  db.run(`
    CREATE TABLE IF NOT EXISTS fasting_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME,
      target_hours REAL DEFAULT 16,
      status TEXT DEFAULT 'active', -- 'active', 'completed'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Table des modèles d'entraînement (Semaine type)
  db.run(`
    CREATE TABLE IF NOT EXISTS workout_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL, -- ex: "Séance Lundi"
      default_day INTEGER, -- 0-6, jour par défaut
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Exercices des modèles
  db.run(`
    CREATE TABLE IF NOT EXISTS workout_template_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      sets INTEGER DEFAULT 3,
      reps INTEGER DEFAULT 10,
      weight REAL,
      notes TEXT,
      FOREIGN KEY(template_id) REFERENCES workout_templates(id),
      FOREIGN KEY(exercise_id) REFERENCES exercises(id)
    )
  `);

  // Table des aliments avec macronutriments
  db.run(`
    CREATE TABLE IF NOT EXISTS food_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      calories INTEGER,
      protein REAL,
      carbs REAL,
      fats REAL,
      fiber REAL,
      sugar REAL,
      sodium INTEGER,
      serving_size TEXT DEFAULT '100g',
      source TEXT DEFAULT 'database',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Index pour les recherches rapides d'aliments
  db.run(`CREATE INDEX IF NOT EXISTS idx_food_name ON food_items(name)`, (err) => {
    if (err) console.error('Erreur création index food_items:', err);
  });

  // Table des sessions d'entraînement complétées
  db.run(`
    CREATE TABLE IF NOT EXISTS workout_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      workout_id INTEGER,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      duration INTEGER, -- durée en secondes
      total_volume REAL, -- volume total (kg)
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(workout_id) REFERENCES workouts(id)
    )
  `);

  // Index pour recherches rapides des sessions d'entraînement
  db.run(`CREATE INDEX IF NOT EXISTS idx_workout_sessions_user ON workout_sessions(user_id, date)`, (err) => {
    if (err) console.error('Erreur création index workout_sessions:', err);
  });

  // Table des séries individuelles d'une session d'entraînement
  db.run(`
    CREATE TABLE IF NOT EXISTS workout_session_series (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      exercise_order INTEGER, -- ordre de l'exercice dans la session
      series_number INTEGER, -- numéro de la série (1, 2, 3...)
      reps INTEGER, -- nombre de répétitions effectuées
      weight REAL, -- poids utilisé (optionnel)
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(session_id) REFERENCES workout_sessions(id),
      FOREIGN KEY(exercise_id) REFERENCES exercises(id)
    )
  `);

  // Index pour recherches rapides des séries
  db.run(`CREATE INDEX IF NOT EXISTS idx_session_series_session ON workout_session_series(session_id)`, (err) => {
    if (err) console.error('Erreur création index workout_session_series:', err);
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_session_series_exercise ON workout_session_series(exercise_id)`, (err) => {
    if (err) console.error('Erreur création index workout_session_series exercise:', err);
  });

  // Table pour stocker les connexions Google Fit
  db.run(`
    CREATE TABLE IF NOT EXISTS oauth_google_fit (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      expires_at DATETIME,
      scope TEXT,
      connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_sync DATETIME,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Table pour stocker les connexions Strava
  db.run(`
    CREATE TABLE IF NOT EXISTS oauth_strava (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      expires_at DATETIME,
      athlete_id INTEGER,
      connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_sync DATETIME,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Table pour stocker les données de santé synchronisées
  db.run(`
    CREATE TABLE IF NOT EXISTS health_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      data_type TEXT NOT NULL, -- 'heart_rate', 'steps', 'calories', 'sleep', 'workout'
      timestamp DATETIME NOT NULL,
      value REAL NOT NULL,
      unit TEXT, -- 'bpm', 'steps', 'kcal', 'minutes', etc.
      source TEXT NOT NULL, -- 'google_fit', 'strava'
      metadata TEXT, -- JSON pour données additionnelles
      synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Index pour recherches rapides des données de santé
  db.run(`CREATE INDEX IF NOT EXISTS idx_health_data_user ON health_data(user_id, data_type, timestamp)`, (err) => {
    if (err) console.error('Erreur création index health_data:', err);
  });

  // Table pour stocker les workouts depuis Strava
  db.run(`
    CREATE TABLE IF NOT EXISTS strava_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      strava_id INTEGER NOT NULL UNIQUE,
      name TEXT,
      sport_type TEXT, -- 'run', 'cycling', 'swim', etc.
      start_date DATETIME,
      elapsed_time INTEGER, -- durée en secondes
      moving_time INTEGER,
      distance REAL, -- en mètres
      elevation_gain REAL,
      average_heart_rate REAL,
      max_heart_rate REAL,
      average_speed REAL,
      max_speed REAL,
      calories REAL,
      description TEXT,
      map_url TEXT,
      imported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Index pour recherches rapides des activités Strava
  db.run(`CREATE INDEX IF NOT EXISTS idx_strava_activities_user ON strava_activities(user_id, start_date)`, (err) => {
    if (err) console.error('Erreur création index strava_activities:', err);
  });
}

module.exports = db;
