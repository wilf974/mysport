const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'mysport.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur de connexion:', err);
    process.exit(1);
  }
  console.log('✅ Connecté à la base de données');
  initDatabase();
});

const userId = 1;

// Programme Full Body - 3 jours/semaine
const programmeData = {
  exercises: [
    // LUNDI - Full Body #1
    { name: 'Squat guidé', muscle_group: 'Jambes', difficulty: 'Intermédiaire', description: 'Squat sur machine guidée' },
    { name: 'Développé couché', muscle_group: 'Poitrine', difficulty: 'Intermédiaire', description: 'Développé couché à la barre' },
    { name: 'Développé militaire debout', muscle_group: 'Épaules', difficulty: 'Intermédiaire', description: 'Développé militaire avec haltères debout' },
    { name: 'Fentes marchées', muscle_group: 'Jambes', difficulty: 'Intermédiaire', description: 'Fentes avec haltères' },
    { name: 'Sissy squat guidé', muscle_group: 'Jambes', difficulty: 'Avancé', description: 'Sissy squat ou squat assis talons levés' },
    { name: 'Écarté poulie', muscle_group: 'Poitrine', difficulty: 'Intermédiaire', description: 'Écarté à la poulie ou pec deck' },
    { name: 'Dips assistés', muscle_group: 'Poitrine', difficulty: 'Intermédiaire', description: 'Dips assistés ou poids du corps' },
    { name: 'Leg curl assis', muscle_group: 'Jambes', difficulty: 'Intermédiaire', description: 'Leg curl assis ou couché' },
    { name: 'Gainage planche', muscle_group: 'Abdominaux', difficulty: 'Intermédiaire', description: 'Planche statique' },
    { name: 'Vacuum abdominal', muscle_group: 'Abdominaux', difficulty: 'Débutant', description: 'Vacuum - respiration abdominale' },

    // MERCREDI - Full Body #2
    { name: 'Soulevé de terre jambes tendues', muscle_group: 'Ischio-jambiers', difficulty: 'Intermédiaire', description: 'Deadlift jambes tendues' },
    { name: 'Tractions', muscle_group: 'Dos', difficulty: 'Avancé', description: 'Tractions avec assistance si besoin' },
    { name: 'Rowing barre', muscle_group: 'Dos', difficulty: 'Intermédiaire', description: 'Rowing à la barre ou haltères' },
    { name: 'Face pulls poulie', muscle_group: 'Épaules', difficulty: 'Intermédiaire', description: 'Face pulls à la poulie' },
    { name: 'Hip Thrust', muscle_group: 'Fessiers', difficulty: 'Intermédiaire', description: 'Hip Thrust barre ou machine' },
    { name: 'Curl incliné', muscle_group: 'Bras', difficulty: 'Intermédiaire', description: 'Curl incliné avec haltères' },
    { name: 'Gainage latéral', muscle_group: 'Abdominaux', difficulty: 'Intermédiaire', description: 'Planche latérale' },

    // JEUDI - Full Body #3
    { name: 'Presse à cuisses', muscle_group: 'Jambes', difficulty: 'Intermédiaire', description: 'Leg press' },
    { name: 'Développé incliné', muscle_group: 'Poitrine', difficulty: 'Intermédiaire', description: 'Développé incliné avec haltères' },
    { name: 'Rowing poulie basse', muscle_group: 'Dos', difficulty: 'Intermédiaire', description: 'Rowing à la poulie basse' },
    { name: 'Curl barre droite', muscle_group: 'Bras', difficulty: 'Intermédiaire', description: 'Curl biceps à la barre droite' },
    { name: 'Extension triceps corde', muscle_group: 'Bras', difficulty: 'Intermédiaire', description: 'Extension triceps à la corde' },
    { name: 'Crunchs', muscle_group: 'Abdominaux', difficulty: 'Débutant', description: 'Crunchs abdominaux' },
    { name: 'Relevés de jambes', muscle_group: 'Abdominaux', difficulty: 'Débutant', description: 'Relevés de jambes suspendus ou au sol' },
    { name: 'Russian twist', muscle_group: 'Abdominaux', difficulty: 'Débutant', description: 'Russian twist avec ou sans poids' },
    { name: 'Mollets debout', muscle_group: 'Mollets', difficulty: 'Débutant', description: 'Élévations mollets debout' },
    { name: 'Mollets assis', muscle_group: 'Mollets', difficulty: 'Débutant', description: 'Élévations mollets assis' }
  ],

  workouts: [
    {
      day: 0, // Lundi
      name: 'Full Body #1 - Poussée / Quadriceps',
      exercises: [
        { name: 'Squat guidé', sets: 4, reps: 10, weight: 15 },
        { name: 'Développé couché', sets: 4, reps: 8, weight: 70 },
        { name: 'Développé militaire debout', sets: 4, reps: 10, weight: null },
        { name: 'Fentes marchées', sets: 3, reps: 12, weight: null, notes: '6/6 par jambe' },
        { name: 'Sissy squat guidé', sets: 3, reps: 12, weight: null },
        { name: 'Écarté poulie', sets: 3, reps: 15, weight: null },
        { name: 'Dips assistés', sets: 3, reps: null, weight: null, notes: 'max reps' },
        { name: 'Leg curl assis', sets: 2, reps: 15, weight: null },
        { name: 'Gainage planche', sets: 3, reps: null, weight: null, notes: '1 min' },
        { name: 'Vacuum abdominal', sets: 3, reps: 10, weight: null, notes: 'respirations' }
      ]
    },
    {
      day: 2, // Mercredi
      name: 'Full Body #2 - Tirage / Ischios',
      exercises: [
        { name: 'Leg curl assis', sets: 3, reps: 15, weight: null },
        { name: 'Soulevé de terre jambes tendues', sets: 4, reps: 10, weight: null },
        { name: 'Tractions', sets: 4, reps: null, weight: null, notes: 'max reps, assistance si besoin' },
        { name: 'Rowing barre', sets: 4, reps: 10, weight: null },
        { name: 'Face pulls poulie', sets: 3, reps: 15, weight: null },
        { name: 'Hip Thrust', sets: 3, reps: 10, weight: null, notes: 'charge modérée' },
        { name: 'Curl incliné', sets: 3, reps: 12, weight: null },
        { name: 'Gainage latéral', sets: 3, reps: null, weight: null, notes: '30-45 sec par côté' }
      ]
    },
    {
      day: 3, // Jeudi
      name: 'Full Body #3 - Volume Global',
      exercises: [
        { name: 'Presse à cuisses', sets: 4, reps: 12, weight: null, notes: '12-15 reps' },
        { name: 'Développé incliné', sets: 4, reps: 10, weight: null },
        { name: 'Rowing poulie basse', sets: 4, reps: 12, weight: null },
        { name: 'Leg curl assis', sets: 3, reps: 12, weight: null },
        { name: 'Curl barre droite', sets: 3, reps: 12, weight: null },
        { name: 'Extension triceps corde', sets: 3, reps: 15, weight: null },
        { name: 'Crunchs', sets: 3, reps: null, weight: null, notes: 'Circuit abdos' },
        { name: 'Relevés de jambes', sets: 3, reps: null, weight: null, notes: 'Circuit abdos' },
        { name: 'Russian twist', sets: 3, reps: null, weight: null, notes: 'Circuit abdos' },
        { name: 'Mollets debout', sets: 4, reps: 15, weight: null, notes: 'PAUSE 1 sec en haut, 15-20 reps' },
        { name: 'Mollets assis', sets: 3, reps: 20, weight: null, notes: '20-25 reps' }
      ]
    }
  ]
};

function initDatabase() {
  console.log('📋 Initialisation des tables...\n');

  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      muscle_group TEXT,
      difficulty TEXT DEFAULT 'Intermédiaire',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      day_of_week INTEGER,
      week_number INTEGER,
      year INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

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
    );

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
    );

    CREATE TABLE IF NOT EXISTS progress_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      photo_data LONGTEXT,
      photo_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      muscle_focus TEXT,
      weight REAL,
      notes TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

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
    );
  `;

  // Exécuter les créations de table une par une
  const tables = [
    `CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      muscle_group TEXT,
      difficulty TEXT DEFAULT 'Intermédiaire',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      day_of_week INTEGER,
      week_number INTEGER,
      year INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS workout_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      sets INTEGER DEFAULT 3,
      reps INTEGER DEFAULT 10,
      weight REAL,
      notes TEXT,
      completed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_exercise_id INTEGER NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      weight REAL,
      sets INTEGER,
      reps INTEGER,
      total_volume REAL,
      notes TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS progress_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      photo_data LONGTEXT,
      photo_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      muscle_focus TEXT,
      weight REAL,
      notes TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS body_measurements (
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
      notes TEXT
    )`
  ];

  let completed = 0;
  tables.forEach(sql => {
    db.run(sql, () => {
      completed++;
      if (completed === tables.length) {
        setTimeout(() => {
          seedDatabase();
        }, 500);
      }
    });
  });
}

function seedDatabase() {
  // Récupérer la semaine courante
  const now = new Date();
  const weekNumber = getWeekNumber(now);
  const year = now.getFullYear();

  // 1. Créer tous les exercices
  console.log('\n📝 Création des exercices...');
  let exercisesCreated = 0;

  programmeData.exercises.forEach(exercise => {
    db.run(
      `INSERT OR IGNORE INTO exercises (user_id, name, description, muscle_group, difficulty)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, exercise.name, exercise.description, exercise.muscle_group, exercise.difficulty],
      function(err) {
        if (!err) {
          console.log(`  ✓ ${exercise.name}`);
        }
        exercisesCreated++;

        // Quand tous les exercices sont créés, créer les entraînements
        if (exercisesCreated === programmeData.exercises.length) {
          setTimeout(() => {
            createWorkouts(weekNumber, year);
          }, 500);
        }
      }
    );
  });
}

function createWorkouts(weekNumber, year) {
  console.log('\n📋 Création des entraînements et ajout des exercices...');
  let workoutsCreated = 0;

  programmeData.workouts.forEach(workout => {
    db.run(
      `INSERT INTO workouts (user_id, day_of_week, week_number, year)
       VALUES (?, ?, ?, ?)`,
      [userId, workout.day, weekNumber, year],
      function(err) {
        if (err) {
          console.error('Erreur création workout:', err);
          return;
        }

        const workoutId = this.lastID;
        const dayName = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][workout.day];
        console.log(`\n  📅 ${dayName} - ${workout.name}`);

        // Ajouter les exercices au workout
        let exercisesAdded = 0;
        workout.exercises.forEach(exercise => {
          db.get(
            `SELECT id FROM exercises WHERE user_id = ? AND name = ?`,
            [userId, exercise.name],
            (err, row) => {
              if (err || !row) {
                console.error(`    ✗ Exercice non trouvé: ${exercise.name}`);
                exercisesAdded++;
                return;
              }

              db.run(
                `INSERT INTO workout_exercises
                 (workout_id, exercise_id, sets, reps, weight, notes)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [workoutId, row.id, exercise.sets, exercise.reps || null, exercise.weight || null, exercise.notes || ''],
                function(err) {
                  if (!err) {
                    const repsInfo = exercise.reps ? `${exercise.reps} reps` : '';
                    const weightInfo = exercise.weight ? `@ ${exercise.weight} kg` : '';
                    const detail = `${exercise.sets}×${repsInfo} ${weightInfo}`;
                    console.log(`    ✓ ${exercise.name} - ${detail}`);
                  }
                  exercisesAdded++;

                  // Quand tous les exercices de ce workout sont ajoutés
                  if (exercisesAdded === workout.exercises.length) {
                    workoutsCreated++;
                    if (workoutsCreated === programmeData.workouts.length) {
                      // Tous les workouts sont créés
                      setTimeout(() => {
                        console.log('\n\n✅ Base de données peuplée avec succès!\n');
                        console.log('📊 Résumé:');
                        console.log(`  • ${programmeData.exercises.length} exercices créés`);
                        console.log(`  • 3 entraînements configurés (Lundi, Mercredi, Jeudi)`);
                        console.log(`  • Semaine ${weekNumber} - ${year}`);
                        console.log('\n💡 Vous pouvez maintenant ouvrir l\'app et voir votre programme!\n');
                        db.close();
                        process.exit(0);
                      }, 1000);
                    }
                  }
                }
              );
            }
          );
        });
      }
    );
  });
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
