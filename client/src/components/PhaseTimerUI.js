import React, { useEffect } from 'react';
import './PhaseTimerUI.css';

function PhaseTimerUI({
  phase,
  timeRemaining,
  totalPhaseTime,
  isRunning,
  isPaused,
  onPhaseComplete,
  onPause,
  onResume,
  onSkip
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const phaseConfig = {
    warmup: {
      title: '🔥 Échauffement',
      subtitle: 'Prépare ton corps',
      icon: '🔥',
      color: '#ff9800'
    },
    cooldown: {
      title: '💨 Cardio Basse Intensité',
      subtitle: 'Retour au calme',
      icon: '💨',
      color: '#2196f3'
    }
  };

  const config = phaseConfig[phase] || {};
  const progress = totalPhaseTime > 0 ? ((totalPhaseTime - timeRemaining) / totalPhaseTime) * 100 : 0;

  // Timer countdown effect
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const interval = setInterval(() => {
      const newTime = timeRemaining - 1;
      if (newTime <= 0) {
        clearInterval(interval);
        onPhaseComplete?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, timeRemaining, onPhaseComplete]);

  return (
    <div className="phase-timer-container">
      <div className="phase-timer-header">
        <div className="phase-title-section">
          <span className="phase-icon">{config.icon}</span>
          <div className="phase-text">
            <h2>{config.title}</h2>
            <p>{config.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="phase-timer-display">
        <div className="timer-ring">
          <svg className="progress-ring" width="240" height="240">
            <circle
              className="progress-ring-bg"
              cx="120"
              cy="120"
              r="110"
            />
            <circle
              className="progress-ring-fill"
              cx="120"
              cy="120"
              r="110"
              style={{
                strokeDasharray: `${2 * Math.PI * 110}`,
                strokeDashoffset: `${2 * Math.PI * 110 * (1 - progress / 100)}`,
                stroke: config.color
              }}
            />
          </svg>
          <div className="timer-display">
            <span className="timer-value">{formatTime(timeRemaining)}</span>
            <span className="timer-label">minutes:secondes</span>
          </div>
        </div>
      </div>

      <div className="phase-timer-controls">
        {!isRunning && !isPaused && (
          <button className="btn-start" onClick={onResume}>
            ▶ Démarrer
          </button>
        )}

        {isRunning && !isPaused && (
          <button className="btn-pause" onClick={onPause}>
            ⏸ Pause
          </button>
        )}

        {isPaused && (
          <button className="btn-resume" onClick={onResume}>
            ▶ Reprendre
          </button>
        )}

        <button className="btn-skip" onClick={onSkip}>
          ⏭ Passer
        </button>
      </div>

      <div className="phase-timer-info">
        <div className="info-box">
          <span className="info-label">Progression</span>
          <span className="info-value">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}

export default PhaseTimerUI;
