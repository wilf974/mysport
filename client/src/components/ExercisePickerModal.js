import React, { useState, useMemo } from 'react';
import EXERCISES from '../data/exercises';
import './ExercisePickerModal.css';

// Map muscle groups to French names and icons
const MUSCLE_GROUP_INFO = {
  pectoraux: { name: 'Pectoraux', icon: '🏋️' },
  dos: { name: 'Dos', icon: '🤸' },
  épaules: { name: 'Épaules', icon: '💪' },
  biceps: { name: 'Biceps', icon: '💪' },
  triceps: { name: 'Triceps', icon: '💪' },
  'avant-bras': { name: 'Avant-bras', icon: '✋' },
  jambes: { name: 'Jambes', icon: '🦵' },
  fesses: { name: 'Fesses', icon: '🍑' },
  abs: { name: 'Abdominaux', icon: '⭐' }
};

const DIFFICULTY_COLORS = {
  beginner: '#10b981',
  intermediate: '#f59e0b',
  advanced: '#ef4444'
};

function ExercisePickerModal({ onSelect, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});

  // Group exercises by muscle group
  const groupedExercises = useMemo(() => {
    const grouped = {};

    EXERCISES.forEach(ex => {
      if (!grouped[ex.muscleGroup]) {
        grouped[ex.muscleGroup] = [];
      }
      grouped[ex.muscleGroup].push(ex);
    });

    // Filter by search term
    if (searchTerm) {
      const filtered = {};
      Object.entries(grouped).forEach(([group, exercises]) => {
        const results = exercises.filter(ex =>
          ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ex.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (results.length > 0) {
          filtered[group] = results;
          // Auto-expand groups with results
          setExpandedGroups(prev => ({ ...prev, [group]: true }));
        }
      });
      return filtered;
    }

    return grouped;
  }, [searchTerm]);

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const handleSelectExercise = (exercise) => {
    onSelect(exercise);
    onClose();
  };

  return (
    <div className="exercise-picker-overlay" onClick={onClose}>
      <div className="exercise-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="exercise-picker-header">
          <h2>Sélectionner un exercice</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="exercise-picker-search">
          <input
            type="text"
            placeholder="Chercher un exercice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div className="exercise-picker-content">
          {Object.entries(groupedExercises).map(([group, exercises]) => {
            const groupInfo = MUSCLE_GROUP_INFO[group] || { name: group, icon: '💪' };
            const isExpanded = expandedGroups[group] ?? true;

            return (
              <div key={group} className="exercise-group">
                <button
                  className="group-header"
                  onClick={() => toggleGroup(group)}
                >
                  <span className="group-toggle">{isExpanded ? '▼' : '▶'}</span>
                  <span className="group-icon">{groupInfo.icon}</span>
                  <span className="group-name">{groupInfo.name}</span>
                  <span className="group-count">({exercises.length})</span>
                </button>

                {isExpanded && (
                  <div className="exercise-grid">
                    {exercises.map(exercise => (
                      <button
                        key={exercise.id}
                        className="exercise-card"
                        onClick={() => handleSelectExercise(exercise)}
                      >
                        <div className="exercise-card-header">
                          <span className="exercise-name">{exercise.name}</span>
                          <span
                            className="difficulty-badge"
                            style={{ backgroundColor: DIFFICULTY_COLORS[exercise.difficulty] }}
                          >
                            {exercise.difficulty === 'beginner' && 'Débutant'}
                            {exercise.difficulty === 'intermediate' && 'Intermédiaire'}
                            {exercise.difficulty === 'advanced' && 'Avancé'}
                          </span>
                        </div>
                        <div className="exercise-card-body">
                          <span className="exercise-name-en">{exercise.nameEn}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {Object.entries(groupedExercises).length === 0 && (
            <div className="no-exercises">
              <p>Aucun exercice trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExercisePickerModal;
