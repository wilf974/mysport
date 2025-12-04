import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WorkoutTimer from './WorkoutTimer';
import './WorkoutModal.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function WorkoutModal({ day, workout, userId, exercises, onAdd, onDelete, onClose, onWorkoutUpdate }) {
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(0);
  const [duration, setDuration] = useState(workout?.duration || '');
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  useEffect(() => {
    if (workout) {
      fetchWorkoutExercises();
      setDuration(workout.duration || '');
    }
  }, [workout]);

  useEffect(() => {
    if (selectedExercise) {
      fetchSuggestion(selectedExercise);
    } else {
      setSuggestion(null);
    }
  }, [selectedExercise]);

  const fetchWorkoutExercises = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/workout-exercises/${workout.id}`);
      setWorkoutExercises(response.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestion = async (exerciseId) => {
    try {
      const response = await axios.get(`${API_URL}/workout-exercises/suggestion/${userId}/${exerciseId}`);
      if (response.data.suggestion) {
        setSuggestion(response.data);
      } else {
        setSuggestion(null);
      }
    } catch (err) {
      console.error('Erreur suggestion:', err);
    }
  };

  const applySuggestion = () => {
    if (suggestion && suggestion.suggestion) {
      setWeight(suggestion.suggestion.weight);
      setReps(suggestion.suggestion.reps);
      setSets(suggestion.suggestion.sets);
    }
  };

  const handleAddExerciseToWorkout = async () => {
    if (!selectedExercise) {
      alert('Veuillez sélectionner un exercice');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/workout-exercises`, {
        workout_id: workout.id,
        exercise_id: parseInt(selectedExercise),
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: parseFloat(weight) || 0
      });

      setWorkoutExercises([...workoutExercises, {
        ...response.data,
        name: exercises.find(e => e.id === parseInt(selectedExercise))?.name
      }]);

      setSelectedExercise('');
      setSets(3);
      setReps(10);
      setWeight(0);
      setSuggestion(null);

      // Rafraîchir le calendrier
      onWorkoutUpdate();
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleDeleteExercise = async (id) => {
    if (!window.confirm('Supprimer cet exercice ?')) return;

    try {
      await axios.delete(`${API_URL}/workout-exercises/${id}`);
      setWorkoutExercises(workoutExercises.filter(ex => ex.id !== id));
      // Rafraîchir le calendrier
      onWorkoutUpdate();
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleUpdateExercise = async (id, field, value) => {
    try {
      const updatedExercise = workoutExercises.find(ex => ex.id === id);
      const updatedData = { ...updatedExercise, [field]: value };

      await axios.put(`${API_URL}/workout-exercises/${id}`, {
        sets: updatedData.sets,
        reps: updatedData.reps,
        weight: updatedData.weight,
        notes: updatedData.notes,
        completed: updatedData.completed
      });

      setWorkoutExercises(workoutExercises.map(ex =>
        ex.id === id ? updatedData : ex
      ));
      // Rafraîchir le calendrier
      onWorkoutUpdate();
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleUpdateDuration = async () => {
    if (!duration) {
      alert('Veuillez entrer une durée');
      return;
    }

    try {
      await axios.put(`${API_URL}/workouts/${workout.id}`, {
        duration: parseInt(duration)
      });
      setIsEditingDuration(false);
      onWorkoutUpdate();
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleCreateWorkout = () => {
    onAdd(duration ? parseInt(duration) : null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{day?.name}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {!workout ? (
            <div className="no-workout-modal">
              <p>Aucun entraînement planifié pour ce jour</p>
              <div className="create-workout-form">
                <div className="form-group">
                  <label>Durée de la séance (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Ex: 60"
                    className="form-control"
                  />
                </div>
                <button className="btn btn-primary" onClick={handleCreateWorkout}>
                  Créer un entraînement
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="workout-header-actions">
                <WorkoutTimer defaultDuration={90} />
              </div>
              <div className="workout-duration-section">
                <div className="duration-display">
                  <h3>⏱️ Durée de la séance</h3>
                  {!isEditingDuration ? (
                    <div className="duration-info">
                      <span className="duration-value">
                        {duration ? `${duration} minutes` : 'Non renseignée'}
                      </span>
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => setIsEditingDuration(true)}
                      >
                        Éditer
                      </button>
                    </div>
                  ) : (
                    <div className="duration-edit">
                      <input
                        type="number"
                        min="1"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="Durée en minutes"
                        className="form-control"
                      />
                      <button
                        className="btn btn-success btn-small"
                        onClick={handleUpdateDuration}
                      >
                        Valider
                      </button>
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => {
                          setIsEditingDuration(false);
                          setDuration(workout.duration || '');
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="add-exercise-form">
                <h3>Ajouter un exercice</h3>

                {suggestion && (
                  <div className="suggestion-alert">
                    <div className="suggestion-content">
                      <span className="suggestion-icon">💡</span>
                      <div>
                        <strong>Suggestion :</strong> {suggestion.reason}
                      </div>
                    </div>
                    <button className="btn-apply-suggestion" onClick={applySuggestion}>
                      Appliquer ({suggestion.suggestion.weight}kg x {suggestion.suggestion.reps})
                    </button>
                  </div>
                )}

                <div className="form-row">
                  <select
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                    className="form-control"
                  >
                    <option value="">-- Sélectionner un exercice --</option>
                    {exercises.map(ex => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name} ({ex.muscle_group})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    placeholder="Séries"
                    className="form-control"
                  />

                  <input
                    type="number"
                    min="1"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    placeholder="Répétitions"
                    className="form-control"
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Poids (kg)"
                    className="form-control"
                  />

                  <button
                    className="btn btn-success"
                    onClick={handleAddExerciseToWorkout}
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              <div className="exercises-in-workout">
                <h3>Exercices du jour</h3>
                {loading ? (
                  <div className="loading">Chargement...</div>
                ) : workoutExercises.length === 0 ? (
                  <p className="text-center">Aucun exercice ajouté</p>
                ) : (
                  <div className="exercises-table">
                    {workoutExercises.map(ex => (
                      <div key={ex.id} className="exercise-row">
                        <div className="exercise-details">
                          <strong>{ex.name}</strong>
                          <div className="exercise-values">
                            <input
                              type="number"
                              min="1"
                              value={ex.sets}
                              onChange={(e) => handleUpdateExercise(ex.id, 'sets', parseInt(e.target.value))}
                              className="input-small"
                            /> x
                            <input
                              type="number"
                              min="1"
                              value={ex.reps}
                              onChange={(e) => handleUpdateExercise(ex.id, 'reps', parseInt(e.target.value))}
                              className="input-small"
                            /> @
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={ex.weight || 0}
                              onChange={(e) => handleUpdateExercise(ex.id, 'weight', parseFloat(e.target.value))}
                              className="input-small"
                            /> kg
                          </div>
                        </div>
                        <label className="checkbox">
                          <input
                            type="checkbox"
                            checked={ex.completed || false}
                            onChange={(e) => handleUpdateExercise(ex.id, 'completed', e.target.checked)}
                          />
                          Complété
                        </label>
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => handleDeleteExercise(ex.id)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {workout && (
          <div className="modal-footer">
            <button className="btn btn-danger" onClick={() => onDelete()}>
              Supprimer l'entraînement
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkoutModal;
