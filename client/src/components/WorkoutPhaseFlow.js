import React, { useState, useEffect, useRef } from 'react';
import UnifiedWorkoutInterface from './UnifiedWorkoutInterface';
import PhaseTimerUI from './PhaseTimerUI';
import WorkoutTracker from './WorkoutTracker';
import { usePhaseTimer } from '../hooks/usePhaseTimer';
import './WorkoutPhaseFlow.css';

/**
 * Gère le flux complet d'une séance:
 * 1. Échauffement (warm-up)
 * 2. Séance principale (workout)
 * 3. Cardio basse intensité (cool-down)
 */
function WorkoutPhaseFlow({ exercises, onClose, onFinish, warmupDuration = 300, cooldownDuration = 600 }) {
  // Use unified interface that integrates all phases
  return (
    <UnifiedWorkoutInterface
      exercises={exercises}
      onClose={onClose}
      onFinish={onFinish}
      warmupDuration={warmupDuration}
      cooldownDuration={cooldownDuration}
    />
  );
}

export default WorkoutPhaseFlow;
