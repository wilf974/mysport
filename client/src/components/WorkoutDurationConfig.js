import React, { useState } from 'react';
import './WorkoutDurationConfig.css';

function WorkoutDurationConfig({ onConfirm, onCancel }) {
  const [warmupMinutes, setWarmupMinutes] = useState(5);
  const [warmupSeconds, setWarmupSeconds] = useState(0);
  const [cooldownMinutes, setCooldownMinutes] = useState(10);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const handleConfirm = () => {
    const warmupDuration = warmupMinutes * 60 + warmupSeconds;
    const cooldownDuration = cooldownMinutes * 60 + cooldownSeconds;
    onConfirm(warmupDuration, cooldownDuration);
  };

  const presets = [
    { label: '2 min', value: 120 },
    { label: '5 min', value: 300 },
    { label: '10 min', value: 600 },
    { label: '15 min', value: 900 }
  ];

  const applyPreset = (field, seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (field === 'warmup') {
      setWarmupMinutes(mins);
      setWarmupSeconds(secs);
    } else {
      setCooldownMinutes(mins);
      setCooldownSeconds(secs);
    }
  };

  return (
    <div className="duration-config-overlay">
      <div className="duration-config-modal">
        <div className="config-header">
          <h2>⏱️ Configuration des phases</h2>
          <p>Personnalisez la durée de votre échauffement et cool-down</p>
        </div>

        <div className="config-body">
          {/* Warmup Configuration */}
          <div className="duration-section">
            <h3>🔥 Échauffement</h3>

            <div className="time-input-group">
              <div className="time-input">
                <label>Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={warmupMinutes}
                  onChange={(e) => setWarmupMinutes(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="time-input">
                <label>Secondes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={warmupSeconds}
                  onChange={(e) => setWarmupSeconds(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="presets">
              {presets.map(preset => (
                <button
                  key={`warmup-${preset.value}`}
                  className={`preset-btn ${
                    warmupMinutes * 60 + warmupSeconds === preset.value ? 'active' : ''
                  }`}
                  onClick={() => applyPreset('warmup', preset.value)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cooldown Configuration */}
          <div className="duration-section">
            <h3>💨 Cool-down (Cardio)</h3>

            <div className="time-input-group">
              <div className="time-input">
                <label>Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={cooldownMinutes}
                  onChange={(e) => setCooldownMinutes(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="time-input">
                <label>Secondes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={cooldownSeconds}
                  onChange={(e) => setCooldownSeconds(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="presets">
              {presets.map(preset => (
                <button
                  key={`cooldown-${preset.value}`}
                  className={`preset-btn ${
                    cooldownMinutes * 60 + cooldownSeconds === preset.value ? 'active' : ''
                  }`}
                  onClick={() => applyPreset('cooldown', preset.value)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="config-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Annuler
          </button>
          <button className="btn btn-success" onClick={handleConfirm}>
            ▶ Démarrer l'entraînement
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkoutDurationConfig;
