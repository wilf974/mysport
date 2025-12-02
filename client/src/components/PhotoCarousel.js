import React, { useState } from 'react';
import './PhotoCarousel.css';

function PhotoCarousel({ photos, workoutInfo, onDelete }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const getDayName = (dayOfWeek) => {
    const daysOfWeek = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    return daysOfWeek[dayOfWeek] || 'Jour ' + dayOfWeek;
  };

  return (
    <div className="photo-carousel-container">
      <div className="carousel-header">
        {workoutInfo && (
          <h3 className="carousel-title">
            📅 {getDayName(workoutInfo.day_of_week)} - Semaine {workoutInfo.week_number}/{workoutInfo.year}
            <span className="exercise-count">🏋️ {workoutInfo.exercise_count} exercices</span>
            {workoutInfo.duration && <span className="workout-duration">⏱️ {workoutInfo.duration} min</span>}
          </h3>
        )}
        <span className="photo-counter">{currentIndex + 1} / {photos.length}</span>
      </div>

      <div className="carousel-wrapper">
        <div className="carousel-main">
          {currentPhoto && currentPhoto.photo_data ? (
            <img
              src={currentPhoto.photo_data}
              alt={`Photo ${currentIndex + 1}`}
              className="carousel-image"
            />
          ) : (
            <div className="carousel-placeholder">
              <div className="emoji-big">📸</div>
            </div>
          )}

          {photos.length > 1 && (
            <>
              <button
                className="carousel-btn carousel-btn-prev"
                onClick={handlePrevious}
                aria-label="Photo précédente"
              >
                ‹
              </button>
              <button
                className="carousel-btn carousel-btn-next"
                onClick={handleNext}
                aria-label="Photo suivante"
              >
                ›
              </button>
            </>
          )}
        </div>

        <div className="carousel-thumbnails">
          {photos.map((photo, index) => (
            <button
              key={index}
              className={`carousel-thumbnail ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Aller à la photo ${index + 1}`}
            >
              <img
                src={photo.photo_data}
                alt={`Thumbnail ${index + 1}`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="carousel-info">
        <div className="photo-details">
          <h4>{currentPhoto.muscle_focus}</h4>
          <div className="photo-meta">
            <span className="date">
              📅 {new Date(currentPhoto.photo_date).toLocaleDateString('fr-FR')}
            </span>
            {currentPhoto.weight && (
              <span className="weight">{currentPhoto.weight} kg</span>
            )}
          </div>
          {currentPhoto.notes && (
            <p className="notes">💬 {currentPhoto.notes}</p>
          )}
        </div>

        <button
          className="btn btn-danger btn-small"
          onClick={() => onDelete(currentPhoto.id)}
          title="Supprimer cette photo"
        >
          🗑️ Supprimer
        </button>
      </div>
    </div>
  );
}

export default PhotoCarousel;
