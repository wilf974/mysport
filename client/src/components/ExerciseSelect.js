import React, { useState, useRef, useEffect } from 'react';
import './ExerciseSelect.css';

function ExerciseSelect({ value, onChange, exercises, placeholder = "-- Sélectionner un exercice --" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter exercises based on search
  const filteredExercises = exercises.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedExercise = exercises.find(ex => ex.id === parseInt(value));

  const handleSelect = (exercise) => {
    onChange(exercise.id.toString());
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="exercise-select-container" ref={dropdownRef}>
      <div
        className="exercise-select-button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 0);
          }
        }}
      >
        <span className="exercise-select-value">
          {selectedExercise ? `${selectedExercise.name} (${selectedExercise.nameEn})` : placeholder}
        </span>
        <span className={`exercise-select-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>

      {isOpen && (
        <div className="exercise-select-menu">
          <input
            ref={inputRef}
            type="text"
            className="exercise-select-search"
            placeholder="Chercher un exercice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="exercise-select-options">
            {filteredExercises.length === 0 ? (
              <div className="exercise-select-no-results">Aucun exercice trouvé</div>
            ) : (
              filteredExercises.map(exercise => (
                <div
                  key={exercise.id}
                  className={`exercise-select-option ${selectedExercise?.id === exercise.id ? 'selected' : ''}`}
                  onClick={() => handleSelect(exercise)}
                >
                  <div className="option-name">
                    {exercise.name} ({exercise.nameEn})
                  </div>
                  <div className="option-muscle-group">{exercise.muscleGroup}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ExerciseSelect;
