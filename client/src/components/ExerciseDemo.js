import React, { useState } from 'react';
import './ExerciseDemo.css';

function ExerciseDemo({ exercise, onClose }) {
  const [imageError, setImageError] = useState(false);
  const [showSideView, setShowSideView] = useState(false);

  if (!exercise) return null;

  const imageUrl = showSideView ? exercise.images?.side : exercise.images?.front;
  const displayImage = imageError ? exercise.fallbackImage : imageUrl;

  return (
    <div className="exercise-demo-overlay" onClick={onClose}>
      <div className="exercise-demo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="exercise-demo-header">
          <div className="exercise-demo-title">
            <h2>{exercise.name}</h2>
            <span className="exercise-demo-muscle">{exercise.muscleGroup}</span>
          </div>
          <button className="exercise-demo-close" onClick={onClose}>✕</button>
        </div>

        <div className="exercise-demo-content">
          <div className="exercise-demo-image-container">
            {displayImage ? (
              <img
                src={displayImage}
                alt={`${exercise.name} - ${showSideView ? 'side' : 'front'} view`}
                className="exercise-demo-image"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="exercise-demo-no-image">
                Aucune image disponible
              </div>
            )}
          </div>

          <div className="exercise-demo-info">
            <div className="exercise-demo-detail">
              <span className="exercise-demo-label">Équipement :</span>
              <span className="exercise-demo-value">{exercise.equipment}</span>
            </div>
            <div className="exercise-demo-detail">
              <span className="exercise-demo-label">Groupe musculaire :</span>
              <span className="exercise-demo-value">{exercise.muscleGroup}</span>
            </div>
            <div className="exercise-demo-detail">
              <span className="exercise-demo-label">Description :</span>
              <span className="exercise-demo-value">{exercise.description}</span>
            </div>
          </div>
        </div>

        <div className="exercise-demo-controls">
          <button
            className={`exercise-demo-view-btn ${!showSideView ? 'active' : ''}`}
            onClick={() => {
              setShowSideView(false);
              setImageError(false);
            }}
          >
            Vue Avant
          </button>
          <button
            className={`exercise-demo-view-btn ${showSideView ? 'active' : ''}`}
            onClick={() => {
              setShowSideView(true);
              setImageError(false);
            }}
          >
            Vue Latérale
          </button>
        </div>

        <div className="exercise-demo-footer">
          <p className="exercise-demo-source">
            Données de <a href="https://github.com/AlimKhan76/musclewiki" target="_blank" rel="noopener noreferrer">MuscleWiki</a>
          </p>
          <button className="exercise-demo-close-btn" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExerciseDemo;
