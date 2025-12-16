const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ==================== EXERCICES ====================
// ==================== EXERCICES ====================
// GET all exercises for a user
app.get('/api/exercises/:userId', (req, res) => {
  const { userId } = req.params;
  db.all('SELECT * FROM exercises WHERE user_id = ? ORDER BY name', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST new exercise
app.post('/api/exercises', (req, res) => {
  const { user_id, name, description, muscle_group, difficulty } = req.body;
  db.run(
    'INSERT INTO exercises (user_id, name, description, muscle_group, difficulty) VALUES (?, ?, ?, ?, ?)',
    [user_id, name, description, muscle_group, difficulty],
    function (err) {
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
    function (err) {
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
    'SELECT id, user_id, day_of_week, week_number, year, created_at, duration, completed FROM workouts WHERE user_id = ? AND week_number = ? AND year = ? ORDER BY day_of_week',
    [userId, week, year],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      console.log(`GET workouts for user ${userId} week ${week}:`, JSON.stringify(rows.map(r => ({ id: r.id, completed: r.completed }))));
      res.json(rows);
    }
  );
});

// DEBUG GET workout by ID
app.get('/api/workouts/debug/:id', (req, res) => {
  db.get('SELECT * FROM workouts WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// POST new workout day
app.post('/api/workouts', (req, res) => {
  const { user_id, day_of_week, week_number, year, duration } = req.body;
  db.run(
    'INSERT INTO workouts (user_id, day_of_week, week_number, year, duration) VALUES (?, ?, ?, ?, ?)',
    [user_id, day_of_week, week_number, year, duration || null],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, user_id, day_of_week, week_number, year, duration: duration || null });
    }
  );
});

// PUT update workout
app.put('/api/workouts/:id', (req, res) => {
  const { id } = req.params;
  const { duration, completed } = req.body;

  console.log(`Updating workout ${id}: duration=${duration}, completed=${completed}`);

  let updates = [];
  let params = [];

  if (duration !== undefined) {
    updates.push('duration = ?');
    params.push(duration);
  }

  if (completed !== undefined) {
    updates.push('completed = ?');
    params.push(completed ? 1 : 0);
  }

  if (updates.length === 0) return res.json({ success: true });

  const query = `UPDATE workouts SET ${updates.join(', ')} WHERE id = ?`;
  params.push(id);

  db.run(query, params, function (err) {
    if (err) {
      console.error('Error updating workout:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log(`Workout ${id} updated successfully. Changes: ${this.changes}`);
    res.json({ id, duration, completed });
  });
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

// ==================== TEMPLATES (SEMAINE TYPE) ====================

// SAVE week as template
app.post('/api/templates/save-week', (req, res) => {
  const { user_id, week, year } = req.body;

  // 1. Delete existing templates for this user
  db.run('DELETE FROM workout_templates WHERE user_id = ?', [user_id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    // 2. Get workouts for the specified week
    db.all(
      'SELECT * FROM workouts WHERE user_id = ? AND week_number = ? AND year = ?',
      [user_id, week, year],
      (err, workouts) => {
        if (err) return res.status(500).json({ error: err.message });

        if (workouts.length === 0) return res.json({ success: true, message: "Aucun entraînement à sauvegarder" });

        let processed = 0;
        workouts.forEach(workout => {
          // Create template for this workout
          db.run(
            'INSERT INTO workout_templates (user_id, name, default_day) VALUES (?, ?, ?)',
            [user_id, `Modèle ${workout.day_of_week}`, workout.day_of_week],
            function (err) {
              if (err) console.error(err);
              const templateId = this.lastID;

              // Copy exercises
              db.all('SELECT * FROM workout_exercises WHERE workout_id = ?', [workout.id], (err, exercises) => {
                if (exercises.length > 0) {
                  const placeholders = exercises.map(() => '(?, ?, ?, ?, ?, ?)').join(',');
                  const values = [];
                  exercises.forEach(ex => {
                    values.push(templateId, ex.exercise_id, ex.sets, ex.reps, ex.weight, ex.notes);
                  });

                  db.run(
                    `INSERT INTO workout_template_exercises (template_id, exercise_id, sets, reps, weight, notes) VALUES ${placeholders}`,
                    values,
                    (err) => {
                      if (err) console.error(err);
                    }
                  );
                }
              });
            }
          );
          processed++;
        });
        res.json({ success: true, count: processed });
      }
    );
  });
});

// APPLY templates to week
app.post('/api/templates/apply', (req, res) => {
  const { user_id, week, year } = req.body;

  // 1. Get templates
  db.all('SELECT * FROM workout_templates WHERE user_id = ?', [user_id], (err, templates) => {
    if (err) return res.status(500).json({ error: err.message });
    if (templates.length === 0) return res.status(404).json({ error: "Aucun modèle trouvé" });

    let created = 0;
    templates.forEach(template => {
      // Check if workout already exists for this day/week
      db.get(
        'SELECT id FROM workouts WHERE user_id = ? AND week_number = ? AND year = ? AND day_of_week = ?',
        [user_id, week, year, template.default_day],
        (err, existing) => {
          if (!existing) {
            // Create workout
            db.run(
              'INSERT INTO workouts (user_id, day_of_week, week_number, year) VALUES (?, ?, ?, ?)',
              [user_id, template.default_day, week, year],
              function (err) {
                if (err) return console.error(err);
                const workoutId = this.lastID;

                // Copy exercises from template
                db.all('SELECT * FROM workout_template_exercises WHERE template_id = ?', [template.id], (err, exercises) => {
                  if (exercises.length > 0) {
                    const placeholders = exercises.map(() => '(?, ?, ?, ?, ?, ?)').join(',');
                    const values = [];
                    exercises.forEach(ex => {
                      values.push(workoutId, ex.exercise_id, ex.sets, ex.reps, ex.weight, ex.notes);
                    });

                    db.run(
                      `INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, notes) VALUES ${placeholders}`,
                      values
                    );
                  }
                });
              }
            );
            created++;
          }
        }
      );
    });

    // Give a small delay for async DB ops to start
    setTimeout(() => {
      res.json({ success: true, message: "Semaine type appliquée" });
    }, 500);
  });
});

// CHECK if templates exist
app.get('/api/templates/check/:userId', (req, res) => {
  db.get('SELECT COUNT(*) as count FROM workout_templates WHERE user_id = ?', [req.params.userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ hasTemplates: row.count > 0 });
  });
});

// ==================== EXERCICES D'ENTRAÎNEMENT ====================
// GET exercises for a workout
app.get('/api/workout-exercises/:workoutId', (req, res) => {
  const { workoutId } = req.params;
  db.all(
    `SELECT we.*, e.name, e.muscle_group FROM workout_exercises we
     JOIN exercises e ON we.exercise_id = e.id
     WHERE we.workout_id = ?
     ORDER BY we.exercise_order ASC, we.created_at ASC`,
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

  // Get the max order for this workout
  db.get(
    'SELECT MAX(exercise_order) as max_order FROM workout_exercises WHERE workout_id = ?',
    [workout_id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      const nextOrder = (row?.max_order || -1) + 1;

      db.run(
        'INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, notes, exercise_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [workout_id, exercise_id, sets || 3, reps || 10, weight || 0, notes || '', nextOrder],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ id: this.lastID, workout_id, exercise_id, sets, reps, weight, notes, exercise_order: nextOrder });
        }
      );
    }
  );
});

// PUT update workout exercise
app.put('/api/workout-exercises/:id', (req, res) => {
  const { id } = req.params;
  const { sets, reps, weight, notes, completed, exercise_order } = req.body;
  db.run(
    'UPDATE workout_exercises SET sets = ?, reps = ?, weight = ?, notes = ?, completed = ?, exercise_order = ? WHERE id = ?',
    [sets, reps, weight, notes, completed, exercise_order || 0, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, sets, reps, weight, notes, completed, exercise_order });
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

// GET progression suggestion for an exercise
app.get('/api/workout-exercises/suggestion/:userId/:exerciseId', (req, res) => {
  const { userId, exerciseId } = req.params;

  // Get last 3 completed sessions for this exercise
  db.all(
    `SELECT we.*, w.created_at 
     FROM workout_exercises we
     JOIN workouts w ON we.workout_id = w.id
     WHERE w.user_id = ? AND we.exercise_id = ? AND we.completed = 1
     ORDER BY w.created_at DESC LIMIT 3`,
    [userId, exerciseId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      if (rows.length < 2) {
        return res.json({ suggestion: null, reason: "Pas assez de données" });
      }

      const last = rows[0];
      const prev = rows[1];

      // Logic 1: If last 2 sessions have same weight and reps >= target (e.g. 10), suggest +2.5kg
      if (last.weight === prev.weight && last.reps >= 10 && prev.reps >= 10) {
        return res.json({
          suggestion: {
            weight: last.weight + 2.5,
            reps: last.reps,
            sets: last.sets
          },
          reason: "Charge stable sur 2 séances, augmentez de 2.5kg !"
        });
      }

      // Logic 2: If RPE is low (< 7) on last session
      if (last.rpe && last.rpe < 7) {
        return res.json({
          suggestion: {
            weight: last.weight + 2.5,
            reps: last.reps,
            sets: last.sets
          },
          reason: "RPE faible, vous pouvez augmenter la charge."
        });
      }

      // Logic 3: If reps increased significantly
      if (last.weight === prev.weight && last.reps > prev.reps + 2) {
        return res.json({
          suggestion: {
            weight: last.weight + 1.25, // Micro-loading
            reps: last.reps - 2,
            sets: last.sets
          },
          reason: "Progression en reps validée, augmentez légèrement le poids."
        });
      }

      res.json({ suggestion: null, reason: "Continuez votre progression actuelle." });
    }
  );
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
    function (err) {
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
    `SELECT p.id, p.photo_data, p.photo_date, p.muscle_focus, p.weight, p.notes, p.workout_id,
            w.day_of_week, w.week_number, w.year, w.created_at as workout_date
     FROM progress_photos p
     LEFT JOIN workouts w ON p.workout_id = w.id
     WHERE p.user_id = ?
     ORDER BY p.photo_date DESC`,
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
// GET workouts for user (for photo association)
app.get('/api/user-workouts/:userId', (req, res) => {
  const { userId } = req.params;
  db.all(
    `SELECT w.id, w.day_of_week, w.week_number, w.year, w.created_at,
            COUNT(we.id) as exercise_count
     FROM workouts w
     LEFT JOIN workout_exercises we ON w.id = we.workout_id
     WHERE w.user_id = ?
     GROUP BY w.id
     ORDER BY w.created_at DESC`,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.post('/api/progress-photos', (req, res) => {
  const { user_id, photo_data, muscle_focus, weight, notes, workout_id } = req.body;
  db.run(
    'INSERT INTO progress_photos (user_id, photo_data, muscle_focus, weight, notes, workout_id) VALUES (?, ?, ?, ?, ?, ?)',
    [user_id, photo_data, muscle_focus, weight, notes, workout_id || null],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, user_id, muscle_focus, weight, notes, workout_id });
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
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});


// DELETE body measurement
app.delete('/api/measurements/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM body_measurements WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
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

// GET progression stats for a specific exercise
app.get('/api/stats/progression/:userId/:exerciseId', (req, res) => {
  const { userId, exerciseId } = req.params;
  db.all(
    `SELECT w.created_at as date, we.weight, we.reps, we.sets, (we.weight * we.reps * we.sets) as volume
     FROM workout_exercises we
     JOIN workouts w ON we.workout_id = w.id
     WHERE w.user_id = ? AND we.exercise_id = ? AND we.completed = 1
     ORDER BY w.created_at ASC`,
    [userId, exerciseId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// GET user streak and attendance
app.get('/api/stats/streak/:userId', (req, res) => {
  const { userId } = req.params;

  db.all(
    `SELECT created_at FROM workouts 
     WHERE user_id = ? 
     ORDER BY created_at DESC`,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      if (rows.length === 0) {
        return res.json({ currentStreak: 0, maxStreak: 0, lastWorkout: null });
      }

      const dates = rows.map(r => new Date(r.created_at).toISOString().split('T')[0]);
      const uniqueDates = [...new Set(dates)];

      let currentStreak = 0;
      let maxStreak = 0;
      let tempStreak = 0;

      // Calculate current streak
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
        currentStreak = 1;
        let checkDate = new Date(uniqueDates[0]);

        for (let i = 1; i < uniqueDates.length; i++) {
          const prevDate = new Date(uniqueDates[i]);
          const diffTime = Math.abs(checkDate - prevDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            currentStreak++;
            checkDate = prevDate;
          } else {
            break;
          }
        }
      }

      // Calculate max streak
      if (uniqueDates.length > 0) {
        tempStreak = 1;
        let checkDate = new Date(uniqueDates[0]);

        for (let i = 1; i < uniqueDates.length; i++) {
          const prevDate = new Date(uniqueDates[i]);
          const diffTime = Math.abs(checkDate - prevDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            tempStreak++;
          } else {
            maxStreak = Math.max(maxStreak, tempStreak);
            tempStreak = 1;
          }
          checkDate = prevDate;
        }
        maxStreak = Math.max(maxStreak, tempStreak);
      }

      res.json({
        currentStreak,
        maxStreak,
        lastWorkout: uniqueDates[0],
        totalWorkouts: rows.length
      });
    }
  );
});

// GET comparison stats for a specific exercise
app.get('/api/stats/comparison/:userId/:exerciseId', (req, res) => {
  const { userId, exerciseId } = req.params;

  // Get all completed sessions for this exercise
  db.all(
    `SELECT w.created_at as date, we.weight, we.reps, we.sets, (we.weight * we.reps * we.sets) as volume
     FROM workout_exercises we
     JOIN workouts w ON we.workout_id = w.id
     WHERE w.user_id = ? AND we.exercise_id = ? AND we.completed = 1
     ORDER BY w.created_at ASC`,
    [userId, exerciseId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      if (rows.length === 0) {
        return res.json({ message: "No data available" });
      }

      // Calculate stats
      const current = rows[rows.length - 1];

      // Find best weight (PR)
      const bestWeight = rows.reduce((prev, current) => (prev.weight > current.weight) ? prev : current);

      // Find best volume
      const bestVolume = rows.reduce((prev, current) => (prev.volume > current.volume) ? prev : current);

      res.json({
        current,
        best_weight: bestWeight,
        best_volume: bestVolume,
        total_sessions: rows.length
      });
    }
  );
});

// GET volume per muscle group (last 30 days)
app.get('/api/stats/volume/:userId', (req, res) => {
  const { userId } = req.params;

  db.all(
    `SELECT e.muscle_group, SUM(we.weight * we.reps * we.sets) as total_volume
     FROM workout_exercises we
     JOIN workouts w ON we.workout_id = w.id
     JOIN exercises e ON we.exercise_id = e.id
     WHERE w.user_id = ? AND we.completed = 1
     AND w.created_at >= date('now', '-30 days')
     GROUP BY e.muscle_group`,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// ==================== WORKOUT SESSIONS (Completed Workouts) ====================

// POST save completed workout session with series data
app.post('/api/workout-sessions/complete', (req, res) => {
  const { user_id, workout_id, duration, notes, seriesHistory, exercisesList } = req.body;

  // Create workout session
  db.run(
    `INSERT INTO workout_sessions (user_id, workout_id, date, duration, notes)
     VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?)`,
    [user_id, workout_id || null, duration || 0, notes || ''],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const sessionId = this.lastID;

      // Calculate total volume and insert series data
      let totalVolume = 0;
      let seriesInserted = 0;
      const totalSeries = Object.keys(seriesHistory || {}).length;

      if (!seriesHistory || totalSeries === 0) {
        // No series data, just return the session
        return res.json({
          id: sessionId,
          user_id,
          workout_id,
          duration,
          notes,
          total_volume: 0
        });
      }

      // Insert each series from seriesHistory
      Object.entries(seriesHistory).forEach(([exerciseIndex, series]) => {
        const idx = parseInt(exerciseIndex);
        const exercise = exercisesList ? exercisesList[idx] : null;
        const exerciseId = exercise?.exercise_id;

        if (!Array.isArray(series)) return;

        series.forEach((reps, seriesNum) => {
          if (reps === null) return; // Skip incomplete series

          const weight = exercise?.weight || 0;
          const volume = (weight || 0) * reps;
          totalVolume += volume;

          db.run(
            `INSERT INTO workout_session_series
             (session_id, exercise_id, exercise_order, series_number, reps, weight)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [sessionId, exerciseId, idx, seriesNum + 1, reps, weight || null]
          );

          seriesInserted++;
        });
      });

      // Update session total volume after a brief delay (for async inserts)
      setTimeout(() => {
        db.run(
          'UPDATE workout_sessions SET total_volume = ? WHERE id = ?',
          [totalVolume, sessionId],
          (err) => {
            if (err) console.error('Error updating session volume:', err);
          }
        );
      }, 100);

      res.json({
        id: sessionId,
        user_id,
        workout_id,
        duration,
        notes,
        total_volume: totalVolume,
        series_count: seriesInserted
      });
    }
  );
});

// GET workout history for user (with series summary)
app.get('/api/workout-sessions/:userId', (req, res) => {
  const { userId } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  db.all(
    `SELECT
       ws.id,
       ws.user_id,
       ws.workout_id,
       ws.date,
       ws.duration,
       ws.total_volume,
       ws.notes,
       COUNT(wss.id) as series_count,
       COUNT(DISTINCT wss.exercise_id) as exercise_count
     FROM workout_sessions ws
     LEFT JOIN workout_session_series wss ON ws.id = wss.session_id
     WHERE ws.user_id = ?
     GROUP BY ws.id
     ORDER BY ws.date DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// GET single workout session with full series details
app.get('/api/workout-sessions/:sessionId/details', (req, res) => {
  const { sessionId } = req.params;

  // Get session header
  db.get(
    `SELECT * FROM workout_sessions WHERE id = ?`,
    [sessionId],
    (err, session) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!session) return res.status(404).json({ error: 'Session not found' });

      // Get all series for this session
      db.all(
        `SELECT wss.*, e.name as exercise_name, e.muscle_group
         FROM workout_session_series wss
         LEFT JOIN exercises e ON wss.exercise_id = e.id
         WHERE wss.session_id = ?
         ORDER BY wss.exercise_order ASC, wss.series_number ASC`,
        [sessionId],
        (err, series) => {
          if (err) return res.status(500).json({ error: err.message });

          // Group series by exercise
          const groupedByExercise = {};
          series.forEach(s => {
            if (!groupedByExercise[s.exercise_order]) {
              groupedByExercise[s.exercise_order] = {
                exercise_id: s.exercise_id,
                exercise_name: s.exercise_name,
                muscle_group: s.muscle_group,
                series: []
              };
            }
            groupedByExercise[s.exercise_order].series.push({
              series_number: s.series_number,
              reps: s.reps,
              weight: s.weight
            });
          });

          res.json({
            ...session,
            exercises: Object.values(groupedByExercise)
          });
        }
      );
    }
  );
});

// GET workout statistics (volume by muscle group from completed sessions)
app.get('/api/stats/session-volume/:userId', (req, res) => {
  const { userId } = req.params;
  const { days = 30 } = req.query;

  db.all(
    `SELECT
       e.muscle_group,
       COUNT(DISTINCT wss.session_id) as session_count,
       COUNT(wss.id) as total_series,
       SUM(wss.reps * COALESCE(wss.weight, 0)) as total_volume,
       AVG(wss.reps) as avg_reps,
       AVG(COALESCE(wss.weight, 0)) as avg_weight
     FROM workout_session_series wss
     JOIN workout_sessions ws ON wss.session_id = ws.id
     LEFT JOIN exercises e ON wss.exercise_id = e.id
     WHERE ws.user_id = ?
       AND ws.date >= date('now', '-' || ? || ' days')
     GROUP BY e.muscle_group
     ORDER BY total_volume DESC`,
    [userId, parseInt(days) || 30],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// DELETE workout session (and all its series)
app.delete('/api/workout-sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  db.run('DELETE FROM workout_session_series WHERE session_id = ?', [sessionId], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    db.run('DELETE FROM workout_sessions WHERE id = ?', [sessionId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

// ==================== NUTRITION ====================
// GET meals for a specific date (or all if no date provided)
app.get('/api/nutrition/:userId', (req, res) => {
  const { userId } = req.params;
  const { date } = req.query; // Format YYYY-MM-DD

  let query = 'SELECT * FROM meals WHERE user_id = ?';
  let params = [userId];

  if (date) {
    query += ' AND date(date) = date(?)';
    params.push(date);
  }

  query += ' ORDER BY date DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST new meal
app.post('/api/nutrition', (req, res) => {
  const { user_id, name, calories, protein, carbs, fats, date, type } = req.body;
  db.run(
    'INSERT INTO meals (user_id, name, calories, protein, carbs, fats, date, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [user_id, name, calories, protein, carbs, fats, date || new Date().toISOString(), type || 'snack'],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, user_id, name, calories, protein, carbs, fats, date, type });
    }
  );
});

// DELETE meal
app.delete('/api/nutrition/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM meals WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// GET nutrition goals
app.get('/api/nutrition/goals/:userId', (req, res) => {
  const { userId } = req.params;
  db.get('SELECT * FROM nutrition_goals WHERE user_id = ?', [userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || {});
  });
});

// POST/UPDATE nutrition goals
app.post('/api/nutrition/goals', (req, res) => {
  const {
    user_id, weight, height, age, gender, activity_level, goal
  } = req.body;

  // Calculate TDEE and Macros
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  let tdee;
  switch (activity_level) {
    case 'sedentary': tdee = bmr * 1.2; break;
    case 'light': tdee = bmr * 1.375; break;
    case 'moderate': tdee = bmr * 1.55; break;
    case 'active': tdee = bmr * 1.725; break;
    case 'very_active': tdee = bmr * 1.9; break;
    default: tdee = bmr * 1.2;
  }

  let targetCalories = tdee;
  if (goal === 'cut') targetCalories -= 500;
  else if (goal === 'bulk') targetCalories += 300;

  // Macro split (Protein 2g/kg, Fats 0.8g/kg, Rest Carbs)
  const protein = Math.round(weight * 2);
  const fats = Math.round(weight * 0.9);
  const carbs = Math.round((targetCalories - (protein * 4 + fats * 9)) / 4);

  db.run(`
    INSERT INTO nutrition_goals (
      user_id, calories, protein, carbs, fats, 
      weight, height, age, gender, activity_level, goal, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      calories = excluded.calories,
      protein = excluded.protein,
      carbs = excluded.carbs,
      fats = excluded.fats,
      weight = excluded.weight,
      height = excluded.height,
      age = excluded.age,
      gender = excluded.gender,
      activity_level = excluded.activity_level,
      goal = excluded.goal,
      updated_at = CURRENT_TIMESTAMP
  `, [
    user_id, Math.round(targetCalories), protein, carbs, fats,
    weight, height, age, gender, activity_level, goal
  ], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      success: true,
      goals: {
        calories: Math.round(targetCalories),
        protein,
        carbs,
        fats
      }
    });
  });
});

// GET favorite meals
app.get('/api/nutrition/favorites/:userId', (req, res) => {
  const { userId } = req.params;
  db.all('SELECT * FROM favorite_meals WHERE user_id = ?', [userId], (err, rows) => {
    res.json(rows);
  });
});

// POST favorite meal
app.post('/api/nutrition/favorites', (req, res) => {
  const { user_id, name, calories, protein, carbs, fats } = req.body;
  db.run(
    'INSERT INTO favorite_meals (user_id, name, calories, protein, carbs, fats) VALUES (?, ?, ?, ?, ?, ?)',
    [user_id, name, calories, protein, carbs, fats],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, user_id, name, calories, protein, carbs, fats });
    }
  );
});

// ==================== RECHERCHE D'ALIMENTS ====================
// Transform Open Food Facts product to our format
function transformOFFProduct(product) {
  if (!product) return null;

  return {
    id: `off_${product.id}`,
    name: product.product_name || product.brands || 'Unknown',
    calories: product.nutriments?.['energy-kcal'] || 0,
    protein: product.nutriments?.proteins || 0,
    carbs: product.nutriments?.carbohydrates || 0,
    fats: product.nutriments?.fat || 0,
    fiber: product.nutriments?.fiber || 0,
    sugar: product.nutriments?.sugars || 0,
    sodium: product.nutriments?.salt ? product.nutriments.salt * 1000 : 0,
    serving_size: product.serving_size || '100g',
    source: 'Open Food Facts',
    barcode: product.code
  };
}

// GET search food items with autocomplete (hybrid: Open Food Facts + local fallback)
app.get('/api/food-search', async (req, res) => {
  const { query, limit = 10 } = req.query;

  if (!query || query.length < 2) {
    return res.json([]);
  }

  try {
    // Try Open Food Facts API first
    const offResponse = await axios.get(
      'https://world.openfoodfacts.org/cgi/search.pl',
      {
        params: {
          search_terms: query,
          search_simple: 1,
          action: 'process',
          json: 1,
          fields: 'code,product_name,brands,nutriments,serving_size'
        },
        timeout: 5000
      }
    );

    if (offResponse.data?.products && offResponse.data.products.length > 0) {
      const results = offResponse.data.products
        .slice(0, parseInt(limit))
        .map(transformOFFProduct)
        .filter(p => p !== null);

      if (results.length > 0) {
        return res.json(results);
      }
    }
  } catch (err) {
    console.error('Open Food Facts API error:', err.message);
    // Fall through to local database
  }

  // Fallback to local database
  const searchTerm = `%${query}%`;
  db.all(
    `SELECT id, name, calories, protein, carbs, fats, fiber, sugar, sodium, serving_size
     FROM food_items
     WHERE name LIKE ?
     ORDER BY name ASC
     LIMIT ?`,
    [searchTerm, parseInt(limit)],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

// GET search by barcode (Open Food Facts)
app.get('/api/food-search/barcode/:barcode', async (req, res) => {
  const { barcode } = req.params;

  if (!barcode || barcode.length < 8) {
    return res.status(400).json({ error: 'Barcode must be at least 8 digits' });
  }

  try {
    const response = await axios.get(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      {
        timeout: 5000
      }
    );

    if (response.data?.product) {
      const product = transformOFFProduct(response.data.product);
      return res.json(product);
    }

    return res.status(404).json({ error: 'Product not found' });
  } catch (err) {
    console.error('Barcode search error:', err.message);
    return res.status(404).json({ error: 'Product not found' });
  }
});

// GET single food item
app.get('/api/food-items/:id', (req, res) => {
  const { id } = req.params;
  db.get(
    'SELECT * FROM food_items WHERE id = ?',
    [id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row || {});
    }
  );
});

// POST new food item to database
app.post('/api/food-items', (req, res) => {
  const { name, calories, protein, carbs, fats, fiber, sugar, sodium, serving_size } = req.body;

  db.run(
    `INSERT INTO food_items (name, calories, protein, carbs, fats, fiber, sugar, sodium, serving_size)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, calories || 0, protein || 0, carbs || 0, fats || 0, fiber || 0, sugar || 0, sodium || 0, serving_size || '100g'],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Cet aliment existe déjà' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({
        id: this.lastID,
        name,
        calories,
        protein,
        carbs,
        fats,
        fiber,
        sugar,
        sodium,
        serving_size
      });
    }
  );
});

// POST bulk import of food items
app.post('/api/food-items/bulk', (req, res) => {
  const { foods } = req.body; // Array of food objects

  if (!Array.isArray(foods) || foods.length === 0) {
    return res.status(400).json({ error: 'Invalid foods array' });
  }

  let inserted = 0;
  let skipped = 0;

  const insertFood = (index) => {
    if (index >= foods.length) {
      return res.json({ success: true, inserted, skipped });
    }

    const food = foods[index];
    db.run(
      `INSERT INTO food_items (name, calories, protein, carbs, fats, fiber, sugar, sodium, serving_size)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        food.name,
        food.calories || 0,
        food.protein || 0,
        food.carbs || 0,
        food.fats || 0,
        food.fiber || 0,
        food.sugar || 0,
        food.sodium || 0,
        food.serving_size || '100g'
      ],
      (err) => {
        if (err && err.message.includes('UNIQUE constraint')) {
          skipped++;
        } else if (!err) {
          inserted++;
        }
        insertFood(index + 1);
      }
    );
  };

  insertFood(0);
});

// ==================== JEÛNE INTERMITTENT ====================
// GET current active fast
app.get('/api/fasting/current/:userId', (req, res) => {
  const { userId } = req.params;
  db.get(
    "SELECT * FROM fasting_logs WHERE user_id = ? AND status = 'active' ORDER BY start_time DESC LIMIT 1",
    [userId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row || null);
    }
  );
});

// GET fasting history
app.get('/api/fasting/history/:userId', (req, res) => {
  const { userId } = req.params;
  db.all(
    "SELECT * FROM fasting_logs WHERE user_id = ? AND status = 'completed' ORDER BY end_time DESC LIMIT 20",
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// POST start fast
app.post('/api/fasting/start', (req, res) => {
  const { user_id, start_time, target_hours } = req.body;

  // Close any existing active fasts first
  db.run(
    "UPDATE fasting_logs SET status = 'completed', end_time = ? WHERE user_id = ? AND status = 'active'",
    [start_time, user_id],
    (err) => {
      if (err) console.error("Error closing previous fast:", err);

      // Start new fast
      db.run(
        "INSERT INTO fasting_logs (user_id, start_time, target_hours, status) VALUES (?, ?, ?, 'active')",
        [user_id, start_time, target_hours],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ id: this.lastID, user_id, start_time, target_hours, status: 'active' });
        }
      );
    }
  );
});

// PUT end fast
app.put('/api/fasting/end', (req, res) => {
  const { user_id, end_time } = req.body;
  db.run(
    "UPDATE fasting_logs SET status = 'completed', end_time = ? WHERE user_id = ? AND status = 'active'",
    [end_time, user_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, end_time });
    }
  );
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`Serveur MySport en cours d'exécution sur le port ${PORT}`);
});

module.exports = app;
// End of file
