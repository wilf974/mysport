const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// ==================== EXERCICES ====================
// GET all exercises for a user
app.get('/api/exercises/:userId', (req, res) => {
  const { userId } = req.params;
  db.all('SELECT * FROM exercises WHERE user_id = ? ORDER BY muscle_group', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST new exercise
app.post('/api/exercises', (req, res) => {
  const { user_id, name, description, muscle_group, difficulty } = req.body;
  db.run(
    'INSERT INTO exercises (user_id, name, description, muscle_group, difficulty) VALUES (?, ?, ?, ?, ?)',
    [user_id, name, description, muscle_group, difficulty || 'intermediate'],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, user_id, name, description, muscle_group, difficulty });
    }
  );
});

// PUT update exercise
app.put('/api/exercises/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, muscle_group, difficulty } = req.body;
  db.run(
    'UPDATE exercises SET name = ?, description = ?, muscle_group = ?, difficulty = ? WHERE id = ?',
    [name, description, muscle_group, difficulty, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, name, description, muscle_group, difficulty });
    }
  );
});

// DELETE exercise
app.delete('/api/exercises/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM exercises WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ==================== ENTRAÎNEMENTS ====================
// GET workouts for a week
app.get('/api/workouts/:userId/:week/:year', (req, res) => {
  const { userId, week, year } = req.params;
  db.all(
    'SELECT * FROM workouts WHERE user_id = ? AND week_number = ? AND year = ? ORDER BY day_of_week',
    [userId, week, year],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// POST new workout day
app.post('/api/workouts', (req, res) => {
  const { user_id, day_of_week, week_number, year } = req.body;
  db.run(
    'INSERT INTO workouts (user_id, day_of_week, week_number, year) VALUES (?, ?, ?, ?)',
    [user_id, day_of_week, week_number, year],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, user_id, day_of_week, week_number, year });
    }
  );
});

// DELETE workout
app.delete('/api/workouts/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM workout_exercises WHERE workout_id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    db.run('DELETE FROM workouts WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

// ==================== EXERCICES D'ENTRAÎNEMENT ====================
// GET exercises for a workout
app.get('/api/workout-exercises/:workoutId', (req, res) => {
  const { workoutId } = req.params;
  db.all(
    `SELECT we.*, e.name, e.muscle_group FROM workout_exercises we
     JOIN exercises e ON we.exercise_id = e.id
     WHERE we.workout_id = ?`,
    [workoutId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// POST add exercise to workout
app.post('/api/workout-exercises', (req, res) => {
  const { workout_id, exercise_id, sets, reps, weight, notes } = req.body;
  db.run(
    'INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [workout_id, exercise_id, sets || 3, reps || 10, weight || 0, notes || ''],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, workout_id, exercise_id, sets, reps, weight, notes });
    }
  );
});

// PUT update workout exercise
app.put('/api/workout-exercises/:id', (req, res) => {
  const { id } = req.params;
  const { sets, reps, weight, notes, completed } = req.body;
  db.run(
    'UPDATE workout_exercises SET sets = ?, reps = ?, weight = ?, notes = ?, completed = ? WHERE id = ?',
    [sets, reps, weight, notes, completed, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, sets, reps, weight, notes, completed });
    }
  );
});

// DELETE exercise from workout
app.delete('/api/workout-exercises/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM workout_exercises WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ==================== PROGRESSION ====================
// GET progression history
app.get('/api/progress/:workoutExerciseId', (req, res) => {
  const { workoutExerciseId } = req.params;
  db.all(
    'SELECT * FROM progress WHERE workout_exercise_id = ? ORDER BY date DESC LIMIT 20',
    [workoutExerciseId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// POST progression entry
app.post('/api/progress', (req, res) => {
  const { workout_exercise_id, weight, sets, reps, total_volume, notes } = req.body;
  db.run(
    'INSERT INTO progress (workout_exercise_id, weight, sets, reps, total_volume, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [workout_exercise_id, weight, sets, reps, total_volume, notes],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, workout_exercise_id, weight, sets, reps, total_volume, notes });
    }
  );
});

// ==================== PHOTOS DE PROGRESSION ====================
// GET progress photos
app.get('/api/progress-photos/:userId', (req, res) => {
  const { userId } = req.params;
  db.all(
    'SELECT id, photo_data, photo_date, muscle_focus, weight, notes FROM progress_photos WHERE user_id = ? ORDER BY photo_date DESC',
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// GET single photo
app.get('/api/progress-photos/:userId/:photoId', (req, res) => {
  const { userId, photoId } = req.params;
  db.get(
    'SELECT * FROM progress_photos WHERE id = ? AND user_id = ?',
    [photoId, userId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row);
    }
  );
});

// POST new progress photo
app.post('/api/progress-photos', (req, res) => {
  const { user_id, photo_data, muscle_focus, weight, notes } = req.body;
  db.run(
    'INSERT INTO progress_photos (user_id, photo_data, muscle_focus, weight, notes) VALUES (?, ?, ?, ?, ?)',
    [user_id, photo_data, muscle_focus, weight, notes],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, user_id, muscle_focus, weight, notes });
    }
  );
});

// DELETE progress photo
app.delete('/api/progress-photos/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM progress_photos WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ==================== MESURES CORPORELLES ====================
// GET body measurements
app.get('/api/measurements/:userId', (req, res) => {
  const { userId } = req.params;
  db.all(
    'SELECT * FROM body_measurements WHERE user_id = ? ORDER BY date DESC LIMIT 50',
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// POST new body measurements
app.post('/api/measurements', (req, res) => {
  const { user_id, neck, shoulders, chest, waist, hips, biceps, forearms, thighs, calves, weight, body_fat_percentage, notes } = req.body;
  db.run(
    `INSERT INTO body_measurements
     (user_id, neck, shoulders, chest, waist, hips, biceps, forearms, thighs, calves, weight, body_fat_percentage, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id, neck, shoulders, chest, waist, hips, biceps, forearms, thighs, calves, weight, body_fat_percentage, notes],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// ==================== STATISTIQUES ====================
// GET stats for a user
app.get('/api/stats/:userId', (req, res) => {
  const { userId } = req.params;

  // Get total workouts
  db.get('SELECT COUNT(*) as count FROM workouts WHERE user_id = ?', [userId], (err, workoutCount) => {
    if (err) return res.status(500).json({ error: err.message });

    // Get personal records
    db.all(
      `SELECT e.name, MAX(p.weight) as max_weight, p.reps
       FROM progress p
       JOIN workout_exercises we ON p.workout_exercise_id = we.id
       JOIN exercises e ON we.exercise_id = e.id
       WHERE we.workout_id IN (SELECT id FROM workouts WHERE user_id = ?)
       GROUP BY e.id`,
      [userId],
      (err, prs) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ total_workouts: workoutCount.count, personal_records: prs });
      }
    );
  });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`Serveur MySport en cours d'exécution sur le port ${PORT}`);
});

module.exports = app;
