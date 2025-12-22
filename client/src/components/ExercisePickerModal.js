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
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'list'

  // Filter exercises based on search
  const filteredExercises = useMemo(() => {
    if (!searchTerm) return EXERCISES;
    return EXERCISES.filter(ex =>
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Group exercises by muscle group
  const groupedExercises = useMemo(() => {
    const grouped = {};

    filteredExercises.forEach(ex => {
      if (!grouped[ex.muscleGroup]) {
        grouped[ex.muscleGroup] = [];
      }
      grouped[ex.muscleGroup].push(ex);
    });

    // Auto-expand groups with results when searching
    if (searchTerm) {
      Object.keys(grouped).forEach(group => {
        setExpandedGroups(prev => ({ ...prev, [group]: true }));
      });
    }

    return grouped;
  }, [filteredExercises, searchTerm]);

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
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Chercher un exercice (nom FR ou EN)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchTerm && <span className="search-count">{filteredExercises.length} résultats</span>}
          </div>
          <div className="view-mode-toggle">
            <button
              className={`toggle-btn ${viewMode === 'grouped' ? 'active' : ''}`}
              onClick={() => setViewMode('grouped')}
              title="Vue groupée par muscle"
            >
              📋
            </button>
            <button
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Vue liste complète"
            >
              📝
            </button>
          </div>
        </div>

        <div className="exercise-picker-content">
          {viewMode === 'grouped' ? (
            // Vue groupée par muscle
            Object.entries(groupedExercises).map(([group, exercises]) => {
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
          })
          ) : (
            // Vue liste complète
            <div className="exercise-list">
              {filteredExercises.length > 0 ? (
                filteredExercises.map(exercise => {
                  const groupInfo = MUSCLE_GROUP_INFO[exercise.muscleGroup] || { name: exercise.muscleGroup, icon: '💪' };
                  return (
                    <button
                      key={exercise.id}
                      className="exercise-list-item"
                      onClick={() => handleSelectExercise(exercise)}
                    >
                      <div className="list-item-content">
                        <div className="list-item-header">
                          <span className="list-item-name">{exercise.name}</span>
                          <span className="list-item-muscle">{groupInfo.icon} {groupInfo.name}</span>
                        </div>
                        <div className="list-item-footer">
                          <span className="list-item-name-en">{exercise.nameEn}</span>
                          <span
                            className="difficulty-badge"
                            style={{ backgroundColor: DIFFICULTY_COLORS[exercise.difficulty] }}
                          >
                            {exercise.difficulty === 'beginner' && 'Débutant'}
                            {exercise.difficulty === 'intermediate' && 'Intermédiaire'}
                            {exercise.difficulty === 'advanced' && 'Avancé'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="no-exercises">
                  <p>Aucun exercice trouvé</p>
                </div>
              )}
            </div>
          )}

          {viewMode === 'grouped' && Object.entries(groupedExercises).length === 0 && (
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
