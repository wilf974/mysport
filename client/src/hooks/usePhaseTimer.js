import { useState, useCallback } from 'react';

/**
 * Hook pour gérer les 3 phases d'une séance d'entraînement:
 * 1. Échauffement (warm-up)
 * 2. Séance principale (workout)
 * 3. Cardio basse intensité (cool-down)
 */
export const usePhaseTimer = (defaultWarmupTime = 300, defaultCooldownTime = 600) => {
  const [currentPhase, setCurrentPhase] = useState('warmup'); // 'warmup' | 'workout' | 'cooldown'
  const [timeRemaining, setTimeRemaining] = useState(defaultWarmupTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [totalPhaseTime, setTotalPhaseTime] = useState(defaultWarmupTime);

  const startWorkoutPhase = useCallback((workoutDuration) => {
    setCurrentPhase('workout');
    setTimeRemaining(workoutDuration);
    setTotalPhaseTime(workoutDuration);
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const startCooldownPhase = useCallback((cooldownDuration = defaultCooldownTime) => {
    setCurrentPhase('cooldown');
    setTimeRemaining(cooldownDuration);
    setTotalPhaseTime(cooldownDuration);
    setIsRunning(true);
    setIsPaused(false);
  }, [defaultCooldownTime]);

  const startWarmup = useCallback((warmupDuration = defaultWarmupTime) => {
    setCurrentPhase('warmup');
    setTimeRemaining(warmupDuration);
    setTotalPhaseTime(warmupDuration);
    setIsRunning(true);
    setIsPaused(false);
  }, [defaultWarmupTime]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(currentPhase === 'warmup' ? defaultWarmupTime : currentPhase === 'cooldown' ? defaultCooldownTime : 0);
  }, [currentPhase, defaultWarmupTime, defaultCooldownTime]);

  const updateTimeRemaining = useCallback((newTime) => {
    setTimeRemaining(Math.max(0, newTime));
  }, []);

  return {
    currentPhase,
    timeRemaining,
    totalPhaseTime,
    isRunning,
    isPaused,
    startWarmup,
    startWorkoutPhase,
    startCooldownPhase,
    pauseTimer,
    resumeTimer,
    stopTimer,
    updateTimeRemaining,
    setCurrentPhase,
    setTimeRemaining
  };
};
