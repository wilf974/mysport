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
}

module.exports = db;
