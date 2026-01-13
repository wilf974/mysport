import React, { useState, useEffect, useCallback } from 'react';
import './RestTimer.css';

/**
 * Composant RestTimer - Timer de repos entre les séries
 * Affiche un compte à rebours avec des options pour passer, prolonger ou ajuster le temps
 */
function RestTimer({
  duration = 60,
  onComplete,
  onSkip,
  onExtend,
  exerciseName = '',
  nextSeriesNumber = 1,
  totalSeries = 1
}) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Reset timer when duration changes
  useEffect(() => {
    setTimeRemaining(duration);
    setIsComplete(false);
    setIsPaused(false);
  }, [duration]);

  // Countdown logic
  useEffect(() => {
    if (isPaused || isComplete || timeRemaining <= 0) {
      if (timeRemaining <= 0 && !isComplete) {
        setIsComplete(true);
        // Vibration si disponible
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
        // Auto-complete après un délai
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 500);
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, isPaused, isComplete, onComplete]);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleSkip = () => {
    setIsComplete(true);
    if (onSkip) onSkip();
  };

  const handleExtend = (seconds) => {
    setTimeRemaining(prev => prev + seconds);
    setIsComplete(false);
    if (onExtend) onExtend(seconds);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const progressPercentage = ((duration - timeRemaining) / duration) * 100;

  return (
    <div className="rest-timer-overlay">
      <div className="rest-timer-container">
        {/* Header */}
        <div className="rest-timer-header">
          <span className="rest-timer-icon">💤</span>
          <h2>Temps de repos</h2>
        </div>

        {/* Exercise info */}
        {exerciseName && (
          <div className="rest-timer-exercise-info">
            <p className="exercise-name">{exerciseName}</p>
            <p className="series-info">
              Prochaine série: {nextSeriesNumber}/{totalSeries}
            </p>
          </div>
        )}

        {/* Circular progress */}
        <div className="rest-timer-circle-container">
          <svg className="rest-timer-circle" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              className="rest-timer-circle-bg"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              className="rest-timer-circle-progress"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="rest-timer-time">
            <span className={`time-display ${timeRemaining <= 5 ? 'time-warning' : ''}`}>
              {formatTime(timeRemaining)}
            </span>
            {isPaused && <span className="paused-indicator">EN PAUSE</span>}
          </div>
        </div>

        {/* Controls */}
        <div className="rest-timer-controls">
          <button
            className="rest-btn rest-btn-secondary"
            onClick={handlePauseResume}
          >
            {isPaused ? '▶ Reprendre' : '⏸ Pause'}
          </button>

          <button
            className="rest-btn rest-btn-primary"
            onClick={handleSkip}
          >
            Passer →
          </button>
        </div>

        {/* Extend options */}
        <div className="rest-timer-extend">
          <span className="extend-label">Ajouter du temps:</span>
          <div className="extend-buttons">
            <button
              className="extend-btn"
              onClick={() => handleExtend(15)}
            >
              +15s
            </button>
            <button
              className="extend-btn"
              onClick={() => handleExtend(30)}
            >
              +30s
            </button>
            <button
              className="extend-btn"
              onClick={() => handleExtend(60)}
            >
              +1min
            </button>
          </div>
        </div>

        {/* Motivation message */}
        <div className="rest-timer-motivation">
          {timeRemaining > 30 ? (
            <p>Respirez profondément et préparez-vous mentalement</p>
          ) : timeRemaining > 10 ? (
            <p>Bientôt prêt ! Préparez votre position</p>
          ) : timeRemaining > 0 ? (
            <p className="ready-message">C'est parti !</p>
          ) : (
            <p className="go-message">GO ! Lancez votre série !</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RestTimer;
