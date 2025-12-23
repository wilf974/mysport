import React, { useState, useEffect } from 'react';
import './UnifiedWorkoutInterface.css';
import ExerciseDemo from './ExerciseDemo';
import { getMuscleWikiExercise } from '../data/muscleWikiMapping';
import { useBackgroundTimer } from '../hooks/useBackgroundTimer';

/**
 * Interface unifiée pour échauffement + séance + cooldown
 * Tout en une seule fenêtre avec un grand timer
 */
function UnifiedWorkoutInterface({
  exercises,
  onClose,
  onFinish,
  warmupDuration = 300,
  cooldownDuration = 600
}) {
  const [currentPhase, setCurrentPhase] = useState('warmup'); // warmup, workout, cooldown
  const [phaseTimeRemaining, setPhaseTimeRemaining] = useState(warmupDuration);
  const [phaseIsRunning, setPhaseIsRunning] = useState(false);
  const [phasePaused, setPhasePaused] = useState(false);

  // Workout tracking
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSeriesIndex, setCurrentSeriesIndex] = useState(0);
  const [repsCompleted, setRepsCompleted] = useState(0);
  const [seriesHistory, setSeriesHistory] = useState({});

  // Background timer for session
  const { time: sessionTimer, isRunning: sessionRunning, isPaused: sessionPaused, start: startSession, pause: pauseSession, resume: resumeSession, stop: stopSession } = useBackgroundTimer();

  // Demo
  const [showExerciseDemo, setShowExerciseDemo] = useState(false);
  const [demonstrationExercise, setDemonstrationExercise] = useState(null);

  // Initialize series history
  useEffect(() => {
    const currentExercise = exercises[currentExerciseIndex];
    if (currentExercise && !seriesHistory[currentExerciseIndex]) {
      const seriesCount = currentExercise.sets || 1;
      setSeriesHistory(prev => ({
        ...prev,
        [currentExerciseIndex]: Array(seriesCount).fill(null)
      }));
      setCurrentSeriesIndex(0);
    }
  }, [currentExerciseIndex, exercises, seriesHistory]);

  // Phase timer countdown
  useEffect(() => {
    if (!phaseIsRunning || phasePaused) return;

    const interval = setInterval(() => {
      setPhaseTimeRemaining(prev => {
        if (prev <= 1) {
          handlePhaseComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phaseIsRunning, phasePaused]);

  const handlePhaseComplete = () => {
    if (currentPhase === 'warmup') {
      // Start workout
      setCurrentPhase('workout');
      setPhaseTimeRemaining(0);
      setPhasePaused(false);
      // Don't auto-start workout, let user click start
    } else if (currentPhase === 'cooldown') {
      // Finish all
      finishWorkout();
    }
  };

  const handleStartPhase = () => {
    if (currentPhase === 'warmup') {
      setPhaseIsRunning(true);
    } else if (currentPhase === 'workout') {
      startSession();
      setPhaseIsRunning(true);
    } else if (currentPhase === 'cooldown') {
      setPhaseIsRunning(true);
    }
  };

  const handlePauseResume = () => {
    if (currentPhase === 'workout') {
      if (sessionPaused) {
        resumeSession();
        setPhaseIsRunning(true);
      } else {
        pauseSession();
        setPhaseIsRunning(false);
      }
    } else {
      setPhasePaused(!phasePaused);
    }
  };

  const handleSkipPhase = () => {
    if (currentPhase === 'warmup') {
      setCurrentPhase('workout');
      setPhaseIsRunning(false);
      setPhaseTimeRemaining(0);
    } else if (currentPhase === 'workout') {
      // Transition to cooldown
      setCurrentPhase('cooldown');
      setPhaseIsRunning(false);
      setPhaseTimeRemaining(cooldownDuration);
    } else if (currentPhase === 'cooldown') {
      finishWorkout();
    }
  };

  const finishWorkout = () => {
    stopSession();
    setPhaseIsRunning(false);
    onFinish(sessionTimer, seriesHistory, exercises);
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

  const handleValidateSeries = () => {
    if (repsCompleted > 0 && seriesHistory[currentExerciseIndex]) {
      const updatedSeries = [...seriesHistory[currentExerciseIndex]];
      updatedSeries[currentSeriesIndex] = repsCompleted;

      setSeriesHistory(prev => ({
        ...prev,
        [currentExerciseIndex]: updatedSeries
      }));

      const totalSeries = exercises[currentExerciseIndex].sets || 1;
      if (currentSeriesIndex < totalSeries - 1) {
        setCurrentSeriesIndex(currentSeriesIndex + 1);
      }
      setRepsCompleted(0);
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const handleShowExerciseDemo = () => {
    const currentExercise = exercises[currentExerciseIndex];
    if (currentExercise) {
      const exerciseData = getMuscleWikiExercise(currentExercise.name);
      if (exerciseData) {
        setDemonstrationExercise(exerciseData);
        setShowExerciseDemo(true);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getPhaseInfo = () => {
    switch (currentPhase) {
      case 'warmup':
        return { icon: '🔥', title: 'Échauffement', color: '#ff9800' };
      case 'cooldown':
        return { icon: '💨', title: 'Cardio Basse Intensité', color: '#2196f3' };
      case 'workout':
      default:
        return { icon: '💪', title: 'Séance Principale', color: '#667eea' };
    }
  };

  const currentExercise = exercises[currentExerciseIndex];
  const phaseInfo = getPhaseInfo();

  // Calculate progress
  const completedExercises = Object.entries(seriesHistory)
    .filter(([_, seriesArray]) => seriesArray && seriesArray.some(s => s !== null))
    .length;
  const progressPercentage = (completedExercises / exercises.length) * 100;

  return (
    <div className="unified-workout-interface">
      {/* Header */}
      <div className="uwi-header" style={{ borderTopColor: phaseInfo.color }}>
        <div className="phase-info">
          <span className="phase-icon">{phaseInfo.icon}</span>
          <h2>{phaseInfo.title}</h2>
        </div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      {/* MAIN TIMER - FULLSCREEN */}
      <div className="uwi-timer-container">
        <div className="uwi-timer-display">
          <div className="uwi-timer-big">{formatTime(currentPhase === 'workout' ? sessionTimer : phaseTimeRemaining)}</div>
          <div className="uwi-phase-label">{phaseInfo.title}</div>
        </div>

        {/* Controls Floating */}
        <div className="uwi-controls-floating">
          {!phaseIsRunning && currentPhase !== 'workout' && (
            <button className="uwi-btn uwi-btn-success" onClick={handleStartPhase}>
              ▶ Démarrer
            </button>
          )}

          {currentPhase === 'workout' && !sessionRunning && (
            <button className="uwi-btn uwi-btn-success" onClick={handleStartPhase}>
              ▶ Démarrer
            </button>
          )}

          {((currentPhase !== 'workout' && phaseIsRunning) || (currentPhase === 'workout' && sessionRunning)) && (
            <>
              <button className="uwi-btn uwi-btn-primary" onClick={handlePauseResume}>
                {currentPhase === 'workout' ? (sessionPaused ? '▶ Reprendre' : '⏸ Pause') : (phasePaused ? '▶ Reprendre' : '⏸ Pause')}
              </button>
              <button className="uwi-btn uwi-btn-danger" onClick={currentPhase === 'cooldown' ? finishWorkout : handleSkipPhase}>
                {currentPhase === 'cooldown' ? '✓ Terminer' : '» Passer'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* WORKOUT CONTENT */}
      {currentPhase === 'workout' && currentExercise && (
        <div className="uwi-workout-content">
          {/* Progress */}
          <div className="uwi-progress-section">
            <div className="progress-info">
              <span>Progression: {completedExercises} / {exercises.length}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>

          {/* Exercise Info */}
          <div className="uwi-exercise-info">
            <div className="exercise-header">
              <h3>{currentExercise.name}</h3>
              <button className="uwi-btn-demo" onClick={handleShowExerciseDemo}>
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

          {/* Series Counter */}
          <div className="uwi-series-section">
            <div className="series-header">
              <h4>📊 Série {currentSeriesIndex + 1}/{currentExercise.sets || 1}</h4>
              <span className="series-badge">{currentSeriesIndex + 1}/{currentExercise.sets || 1}</span>
            </div>

            <div className="counter-section">
              <p>Combien de répétitions ?</p>
              <div className="reps-counter">
                <button className="counter-btn" onClick={handleRepDecrement}>−</button>
                <div className="counter-display">{repsCompleted}</div>
                <button className="counter-btn" onClick={handleRepIncrement}>+</button>
              </div>
            </div>

            <div className="counter-actions">
              <button className="uwi-btn uwi-btn-secondary" onClick={handleResetReps}>
                Réinitialiser
              </button>
              <button className="uwi-btn uwi-btn-success" onClick={handleValidateSeries} disabled={repsCompleted === 0}>
                ✓ Valider cette série
              </button>
            </div>

            {/* Series History */}
            {seriesHistory[currentExerciseIndex] && seriesHistory[currentExerciseIndex].some(s => s !== null) && (
              <div className="series-history">
                <h5>📝 Séries complétées:</h5>
                <div className="series-list">
                  {seriesHistory[currentExerciseIndex].map((reps, idx) => (
                    <div key={idx} className={`series-item ${reps !== null ? 'completed' : 'pending'}`}>
                      <span>Série {idx + 1}</span>
                      <span>{reps !== null ? `${reps} reps` : '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Exercise Navigation */}
          <div className="uwi-navigation">
            <button className="uwi-btn uwi-btn-secondary" onClick={handlePreviousExercise} disabled={currentExerciseIndex === 0}>
              ← Précédent
            </button>
            <button className="uwi-btn uwi-btn-secondary" onClick={handleNextExercise} disabled={currentExerciseIndex === exercises.length - 1}>
              Suivant →
            </button>
          </div>
        </div>
      )}

      {/* Demo Modal */}
      {showExerciseDemo && demonstrationExercise && (
        <ExerciseDemo
          exercise={demonstrationExercise}
          onClose={() => setShowExerciseDemo(false)}
        />
      )}
    </div>
  );
}

export default UnifiedWorkoutInterface;
