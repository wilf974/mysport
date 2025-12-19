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
  // Helper pour exécuter les commandes SQL en séquence
  const executeSequentially = (queries, index = 0, onComplete) => {
    if (index >= queries.length) {
      if (onComplete) onComplete();
      return;
    }

    const { sql, callback } = queries[index];
    db.run(sql, (err) => {
      if (callback) callback(err);
      executeSequentially(queries, index + 1, onComplete);
    });
  };

  const queries = [
    // Table des utilisateurs
    {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
      callback: null
    },
    // Table des exercices
    {
      sql: `
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
      `,
      callback: null
    },
    // Table des entraînements (semaine)
    {
      sql: `
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
      `,
      callback: null
    },
    // Table de liaison: entraînements et exercices
    {
      sql: `
        CREATE TABLE IF NOT EXISTS workout_exercises (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          workout_id INTEGER NOT NULL,
          exercise_id INTEGER NOT NULL,
          sets INTEGER DEFAULT 3,
          reps INTEGER DEFAULT 10,
          weight REAL,
          notes TEXT,
          completed BOOLEAN DEFAULT 0,
          exercise_order INTEGER DEFAULT 0,
          rpe REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(workout_id) REFERENCES workouts(id),
          FOREIGN KEY(exercise_id) REFERENCES exercises(id)
        )
      `,
      callback: null
    },
    // Table de progression (poids, volume, etc.)
    {
      sql: `
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
      `,
      callback: null
    },
    // Table des photos de progression
    {
      sql: `
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
      `,
      callback: null
    },
    // Table des mesures corporelles
    {
      sql: `
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
      `,
      callback: null
    },
    // Table des repas (Nutrition)
    {
      sql: `
        CREATE TABLE IF NOT EXISTS meals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          calories INTEGER,
          protein REAL,
          carbs REAL,
          fats REAL,
          date DATETIME DEFAULT CURRENT_TIMESTAMP,
          type TEXT,
          FOREIGN KEY(user_id) REFERENCES users(id)
        )
      `,
      callback: null
    },
    // Table des repas favoris
    {
      sql: `
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
      `,
      callback: null
    },
    // Table des objectifs nutritionnels
    {
      sql: `
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
          gender TEXT,
          activity_level TEXT,
          goal TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id)
        )
      `,
      callback: null
    },
    // Table des scores de récupération
    {
      sql: `
        CREATE TABLE IF NOT EXISTS recovery_scores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          date DATETIME DEFAULT CURRENT_TIMESTAMP,
          sleep_score INTEGER,
          energy_score INTEGER,
          mood_score INTEGER,
          soreness_score INTEGER,
          notes TEXT,
          FOREIGN KEY(user_id) REFERENCES users(id)
        )
      `,
      callback: null
    },
    // Table des objectifs mensuels
    {
      sql: `
        CREATE TABLE IF NOT EXISTS monthly_goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          target_value REAL,
          current_value REAL DEFAULT 0,
          unit TEXT,
          month INTEGER,
          year INTEGER,
          completed BOOLEAN DEFAULT 0,
          category TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id)
        )
      `,
      callback: null
    },
    // Table des jeûnes
    {
      sql: `
        CREATE TABLE IF NOT EXISTS fasting_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          start_time DATETIME NOT NULL,
          end_time DATETIME,
          target_hours REAL DEFAULT 16,
          status TEXT DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id)
        )
      `,
      callback: null
    },
    // Table des modèles d'entraînement (Semaine type)
    {
      sql: `
        CREATE TABLE IF NOT EXISTS workout_templates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          default_day INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id)
        )
      `,
      callback: null
    },
    // Exercices des modèles
    {
      sql: `
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
      `,
      callback: null
    },
    // Table des aliments avec macronutriments
    {
      sql: `
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
          source TEXT DEFAULT 'database'
        )
      `,
      callback: null
    }
  ];

  // Additional tables and indices to create sequentially
  const additionalQueries = [
    // Table des sessions d'entraînement complétées
    {
      sql: `
        CREATE TABLE IF NOT EXISTS workout_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          workout_id INTEGER,
          date DATETIME DEFAULT CURRENT_TIMESTAMP,
          duration INTEGER,
          total_volume REAL,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id),
          FOREIGN KEY(workout_id) REFERENCES workouts(id)
        )
      `,
      callback: null
    },
    // Table des séries individuelles d'une session d'entraînement
    {
      sql: `
        CREATE TABLE IF NOT EXISTS workout_session_series (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id INTEGER NOT NULL,
          exercise_id INTEGER NOT NULL,
          exercise_order INTEGER,
          series_number INTEGER,
          reps INTEGER,
          weight REAL,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(session_id) REFERENCES workout_sessions(id),
          FOREIGN KEY(exercise_id) REFERENCES exercises(id)
        )
      `,
      callback: null
    },
    // Table pour stocker les connexions Google Fit
    {
      sql: `
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
      `,
      callback: null
    },
    // Table pour stocker les connexions Strava
    {
      sql: `
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
      `,
      callback: null
    },
    // Table pour stocker les données de santé synchronisées
    {
      sql: `
        CREATE TABLE IF NOT EXISTS health_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          data_type TEXT NOT NULL,
          timestamp DATETIME NOT NULL,
          value REAL NOT NULL,
          unit TEXT,
          source TEXT NOT NULL,
          metadata TEXT,
          synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id)
        )
      `,
      callback: null
    },
    // Table pour stocker les workouts depuis Strava
    {
      sql: `
        CREATE TABLE IF NOT EXISTS strava_activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          strava_id INTEGER NOT NULL UNIQUE,
          name TEXT,
          sport_type TEXT,
          start_date DATETIME,
          elapsed_time INTEGER,
          moving_time INTEGER,
          distance REAL,
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
      `,
      callback: null
    }
  ];

  // Execute all queries sequentially
  executeSequentially([...queries, ...additionalQueries], 0, () => {
    // After tables are created, create indices
    db.run(`CREATE INDEX IF NOT EXISTS idx_food_name ON food_items(name)`, (err) => {
      if (err && !err.message.includes('no such table')) console.error('Erreur création index food_items:', err);
    });
    db.run(`CREATE INDEX IF NOT EXISTS idx_workout_sessions_user ON workout_sessions(user_id, date)`, (err) => {
      if (err && !err.message.includes('no such table')) console.error('Erreur création index workout_sessions:', err);
    });
    db.run(`CREATE INDEX IF NOT EXISTS idx_session_series_session ON workout_session_series(session_id)`, (err) => {
      if (err && !err.message.includes('no such table')) console.error('Erreur création index workout_session_series:', err);
    });
    db.run(`CREATE INDEX IF NOT EXISTS idx_session_series_exercise ON workout_session_series(exercise_id)`, (err) => {
      if (err && !err.message.includes('no such table')) console.error('Erreur création index workout_session_series exercise:', err);
    });
    db.run(`CREATE INDEX IF NOT EXISTS idx_health_data ON health_data(user_id, data_type, timestamp)`, (err) => {
      if (err && !err.message.includes('no such table')) console.error('Erreur création index health_data:', err);
    });
    db.run(`CREATE INDEX IF NOT EXISTS idx_strava_activities ON strava_activities(user_id, timestamp)`, (err) => {
      if (err && !err.message.includes('no such table')) console.error('Erreur création index strava_activities:', err);
    });
    console.log('✅ Base de données initialisée avec succès');
  });
}

module.exports = db;
