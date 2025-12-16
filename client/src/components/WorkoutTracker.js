import React, { useState, useEffect } from 'react';
import './WorkoutTracker.css';
import ExerciseDemo from './ExerciseDemo';
import { getMuscleWikiExercise } from '../data/muscleWikiMapping';
import { useBackgroundTimer } from '../hooks/useBackgroundTimer';

function WorkoutTracker({ exercises, onClose, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [repsCompleted, setRepsCompleted] = useState(0);
  const [exerciseProgress, setExerciseProgress] = useState({});
  const [showExerciseDemo, setShowExerciseDemo] = useState(false);
  const [demonstrationExercise, setDemonstrationExercise] = useState(null);

  // Use background timer that works even when device is locked
  const { time: timer, isRunning, isPaused, start, pause, resume, stop, reset } = useBackgroundTimer();

  // Reset reps when changing exercise
  useEffect(() => {
    setRepsCompleted(0);
  }, [currentIndex]);

  const handleStartWorkout = () => {
    start();
  };

  const handleStopWorkout = () => {
    stop();
    onFinish(timer);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resume();
    } else {
      pause();
    }
  };

  const handleRepIncrement = () => {
    setRepsCompleted(prev => prev + 1);
  };

  const handleRepDecrement = () => {
    setRepsCompleted(prev => (prev > 0 ? prev - 1 : 0));
  };

  const handleResetReps = () => {
    setRepsCompleted(0);
  };

  const handleCompleteExercise = () => {
    if (repsCompleted > 0) {
      setExerciseProgress({
        ...exerciseProgress,
        [currentIndex]: { completed: true, reps: repsCompleted }
      });
      if (currentIndex < exercises.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  const handlePreviousExercise = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNextExercise = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleShowExerciseDemo = () => {
    if (currentExercise) {
      const exerciseData = getMuscleWikiExercise(currentExercise.name);
      if (exerciseData) {
        setDemonstrationExercise(exerciseData);
        setShowExerciseDemo(true);
      }
    }
  };

  const handleCloseExerciseDemo = () => {
    setShowExerciseDemo(false);
    setDemonstrationExercise(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentExercise = exercises[currentIndex];
  const completedCount = Object.values(exerciseProgress).filter(p => p.completed).length;
  const progressPercentage = (completedCount / exercises.length) * 100;

  return (
    <div className="workout-tracker-overlay">
      <div className="workout-tracker">
        {/* Header */}
        <div className="tracker-header">
          <h2>Entraînement en cours</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Timer Section */}
        <div className="timer-section">
          <div className="timer-display">
            <div className="timer-time">{formatTime(timer)}</div>
            <div className="timer-label">Durée totale</div>
          </div>
          <div className="timer-controls">
            {!isRunning ? (
              <button
                className="btn btn-success btn-lg"
                onClick={handleStartWorkout}
              >
                ▶ Démarrer
              </button>
            ) : (
              <>
                <button
                  className={`btn btn-primary btn-lg ${isPaused ? 'resumed' : ''}`}
                  onClick={handlePauseResume}
                >
                  {isPaused ? '▶ Reprendre' : '⏸ Pause'}
                </button>
                <button
                  className="btn btn-danger btn-lg"
                  onClick={handleStopWorkout}
                >
                  ◾ Terminer
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div className="progress-info">
            <span>Progression: {completedCount} / {exercises.length}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>

        {/* Current Exercise */}
        {currentExercise && (
          <div className="current-exercise">
            <div className="exercise-header">
              <h3 className="exercise-name">{currentExercise.name}</h3>
              <button
                className="btn-exercise-demo"
                onClick={handleShowExerciseDemo}
                title="Voir la démonstration de l'exercice"
              >
                🎬 Voir la démo
              </button>
            </div>
            <div className="exercise-details">
              <div className="detail-box">
                <div className="detail-label">Séries</div>
                <div className="detail-value">{currentExercise.sets}</div>
              </div>
              <div className="detail-box">
                <div className="detail-label">Répétitions</div>
                <div className="detail-value">{currentExercise.reps}</div>
              </div>
              <div className="detail-box">
                <div className="detail-label">Poids</div>
                <div className="detail-value">{currentExercise.weight || '-'} kg</div>
              </div>
            </div>
          </div>
        )}

        {/* Reps Counter */}
        <div className="reps-counter-section">
          <h4>Compteur de répétitions</h4>
          <div className="reps-counter">
            <button className="counter-btn" onClick={handleRepDecrement}>−</button>
            <div className="counter-display">{repsCompleted}</div>
            <button className="counter-btn" onClick={handleRepIncrement}>+</button>
          </div>
          <div className="counter-actions">
            <button className="btn btn-secondary" onClick={handleResetReps}>
              Réinitialiser
            </button>
            <button
              className="btn btn-success"
              onClick={handleCompleteExercise}
              disabled={repsCompleted === 0}
            >
              Valider l'exercice
            </button>
          </div>
        </div>

        {/* Exercise Navigation */}
        <div className="exercise-navigation">
          <button
            className="btn btn-secondary"
            onClick={handlePreviousExercise}
            disabled={currentIndex === 0}
          >
            ← Précédent
          </button>
          <div className="exercise-list">
            {exercises.map((ex, index) => (
              <button
                key={index}
                className={`exercise-item ${
                  index === currentIndex ? 'active' : ''
                } ${exerciseProgress[index]?.completed ? 'completed' : ''}`}
                onClick={() => setCurrentIndex(index)}
                title={ex.name}
              >
                {exerciseProgress[index]?.completed ? (
                  <span className="checkmark">✓</span>
                ) : (
                  <span className="exercise-index">{index + 1}</span>
                )}
              </button>
            ))}
          </div>
          <button
            className="btn btn-secondary"
            onClick={handleNextExercise}
            disabled={currentIndex === exercises.length - 1}
          >
            Suivant →
          </button>
        </div>

        {/* Exercise Notes */}
        {currentExercise?.notes && (
          <div className="exercise-notes">
            📝 {currentExercise.notes}
          </div>
        )}

        {/* Summary */}
        <div className="tracker-summary">
          <div className="summary-stat">
            <div className="label">Exercices complétés</div>
            <div className="value">{completedCount} / {exercises.length}</div>
          </div>
          <div className="summary-stat">
            <div className="label">Durée</div>
            <div className="value">{formatTime(timer)}</div>
          </div>
          <div className="summary-stat">
            <div className="label">Reps actuelles</div>
            <div className="value">{repsCompleted}</div>
          </div>
        </div>
      </div>

      {/* Exercise Demo Modal */}
      {showExerciseDemo && demonstrationExercise && (
        <ExerciseDemo
          exercise={demonstrationExercise}
          onClose={handleCloseExerciseDemo}
        />
      )}
    </div>
  );
}

export default WorkoutTracker;
