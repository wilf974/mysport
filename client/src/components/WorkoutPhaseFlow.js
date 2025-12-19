import React, { useState, useEffect, useRef } from 'react';
import WorkoutTracker from './WorkoutTracker';
import PhaseTimerUI from './PhaseTimerUI';
import { usePhaseTimer } from '../hooks/usePhaseTimer';
import './WorkoutPhaseFlow.css';

/**
 * Gère le flux complet d'une séance:
 * 1. Échauffement (warm-up)
 * 2. Séance principale (workout)
 * 3. Cardio basse intensité (cool-down)
 */
function WorkoutPhaseFlow({ exercises, onClose, onFinish, warmupDuration = 300, cooldownDuration = 600 }) {
  const phaseTimer = usePhaseTimer(warmupDuration, cooldownDuration);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [phaseCompleted, setPhaseCompleted] = useState({
    warmup: false,
    workout: false,
    cooldown: false
  });

  const timerIntervalRef = useRef(null);

  // Start warm-up automatically
  useEffect(() => {
    phaseTimer.startWarmup(warmupDuration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warmupDuration]);

  // Handle phase timer countdown
  useEffect(() => {
    if (!phaseTimer.isRunning || phaseTimer.isPaused) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      phaseTimer.setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(timerIntervalRef.current);
          handlePhaseComplete();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseTimer.isRunning, phaseTimer.isPaused]);

  const handlePhaseComplete = () => {
    const { currentPhase } = phaseTimer;

    if (currentPhase === 'warmup') {
      setPhaseCompleted(prev => ({ ...prev, warmup: true }));
      showPhaseTransition('warmup', 'workout');
    } else if (currentPhase === 'cooldown') {
      setPhaseCompleted(prev => ({ ...prev, cooldown: true }));
      finishAllPhases();
    }
  };

  const showPhaseTransition = (from, to) => {
    setTimeout(() => {
      if (to === 'workout') {
        transitionToWorkout();
      } else if (to === 'cooldown') {
        transitionToCooldown();
      }
    }, 2000); // Show completion message for 2 seconds
  };

  const transitionToWorkout = () => {
    setPhaseCompleted(prev => ({ ...prev, warmup: false }));
  };

  const transitionToCooldown = () => {
    setPhaseCompleted(prev => ({ ...prev, workout: false }));
    const cooldownTime = cooldownDuration || 600;
    phaseTimer.startCooldownPhase(cooldownTime);
  };

  const handleWorkoutFinish = (duration, seriesHistory, exercisesList) => {
    setWorkoutDuration(duration);
    setPhaseCompleted(prev => ({ ...prev, workout: true }));
    transitionToCooldown();
  };

  const handleSkipPhase = () => {
    const { currentPhase } = phaseTimer;

    if (currentPhase === 'warmup') {
      setPhaseCompleted(prev => ({ ...prev, warmup: true }));
      transitionToWorkout();
    } else if (currentPhase === 'cooldown') {
      finishAllPhases();
    }
  };

  const finishAllPhases = () => {
    phaseTimer.stopTimer();
    setPhaseCompleted(prev => ({ ...prev, cooldown: true }));

    // Call parent onFinish with aggregated data
    const totalDuration = workoutDuration || 0;
    setTimeout(() => {
      onFinish(totalDuration);
    }, 1000);
  };

  const { currentPhase, timeRemaining, totalPhaseTime, isRunning, isPaused } = phaseTimer;

  return (
    <div className="workout-phase-flow">
      {/* WARM-UP PHASE */}
      {currentPhase === 'warmup' && !phaseCompleted.warmup && (
        <PhaseTimerUI
          phase="warmup"
          timeRemaining={timeRemaining}
          totalPhaseTime={totalPhaseTime}
          isRunning={isRunning}
          isPaused={isPaused}
          onPhaseComplete={handlePhaseComplete}
          onPause={() => phaseTimer.pauseTimer()}
          onResume={() => phaseTimer.resumeTimer()}
          onSkip={handleSkipPhase}
        />
      )}

      {/* WARM-UP COMPLETED MESSAGE */}
      {phaseCompleted.warmup && !phaseCompleted.workout && (
        <div className="phase-transition-screen">
          <div className="transition-content">
            <span className="transition-icon">✅</span>
            <h2>Échauffement Complété!</h2>
            <p>Prépare-toi pour la séance principale...</p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}

      {/* WORKOUT PHASE */}
      {phaseCompleted.warmup && currentPhase === 'workout' && !phaseCompleted.workout && (
        <WorkoutTracker
          exercises={exercises}
          onClose={onClose}
          onFinish={handleWorkoutFinish}
        />
      )}

      {/* WORKOUT COMPLETED MESSAGE */}
      {phaseCompleted.workout && !phaseCompleted.cooldown && (
        <div className="phase-transition-screen">
          <div className="transition-content">
            <span className="transition-icon">🎉</span>
            <h2>Séance Terminée!</h2>
            <p>Passage au cardio basse intensité...</p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}

      {/* COOL-DOWN PHASE */}
      {phaseCompleted.workout && currentPhase === 'cooldown' && !phaseCompleted.cooldown && (
        <PhaseTimerUI
          phase="cooldown"
          timeRemaining={timeRemaining}
          totalPhaseTime={totalPhaseTime}
          isRunning={isRunning}
          isPaused={isPaused}
          onPhaseComplete={handlePhaseComplete}
          onPause={() => phaseTimer.pauseTimer()}
          onResume={() => phaseTimer.resumeTimer()}
          onSkip={handleSkipPhase}
        />
      )}

      {/* ALL COMPLETED */}
      {phaseCompleted.cooldown && (
        <div className="phase-transition-screen final">
          <div className="transition-content">
            <span className="transition-icon final-icon">🏆</span>
            <h2>Entraînement Complet!</h2>
            <p>Excellent travail!</p>
            <div className="session-summary">
              <div className="summary-item">
                <span className="summary-label">Séance principale</span>
                <span className="summary-value">{Math.floor(workoutDuration / 60)}:{(workoutDuration % 60).toString().padStart(2, '0')}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Cardio</span>
                <span className="summary-value">{Math.floor(cooldownDuration / 60)}:{(cooldownDuration % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutPhaseFlow;
