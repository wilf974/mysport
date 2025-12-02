import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgressPhotos.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const MUSCLE_FOCUS = ['Poitrine', 'Dos', 'Épaules', 'Bras', 'Jambes', 'Abdominaux', 'Corps entier'];

function ProgressPhotos({ userId }) {
  const [photos, setPhotos] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    muscle_focus: 'Corps entier',
    weight: '',
    notes: '',
    workout_id: ''
  });

  useEffect(() => {
    fetchPhotos();
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const response = await axios.get(`${API_URL}/user-workouts/${userId}`);
      setWorkouts(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des séances:', err);
    }
  };

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/progress-photos/${userId}`);
      setPhotos(response.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(reader.result);
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Veuillez sélectionner une photo');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/progress-photos`, {
        user_id: userId,
        photo_data: selectedFile,
        muscle_focus: formData.muscle_focus,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        notes: formData.notes,
        workout_id: formData.workout_id ? parseInt(formData.workout_id) : null
      });

      // Find the selected workout if one was chosen
      const selectedWorkout = formData.workout_id
        ? workouts.find(w => w.id === parseInt(formData.workout_id))
        : null;

      const newPhoto = {
        ...response.data,
        photo_date: new Date().toISOString(),
        photo_data: selectedFile,
        ...(selectedWorkout && {
          day_of_week: selectedWorkout.day_of_week,
          week_number: selectedWorkout.week_number,
          year: selectedWorkout.year,
          workout_date: selectedWorkout.created_at,
          exercise_count: selectedWorkout.exercise_count
        })
      };

      setPhotos([newPhoto, ...photos]);
      setShowForm(false);
      setSelectedFile(null);
      setPreview(null);
      setFormData({
        muscle_focus: 'Corps entier',
        weight: '',
        notes: '',
        workout_id: ''
      });
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors du téléchargement de la photo');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) return;

    try {
      await axios.delete(`${API_URL}/progress-photos/${photoId}`);
      setPhotos(photos.filter(p => p.id !== photoId));
      setSelectedPhotoId(null);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  return (
    <div className="progress-photos">
      <div className="photos-header">
        <h2>📸 Suivi par Photos</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Annuler' : '+ Ajouter une photo'}
        </button>
      </div>

      {showForm && (
        <div className="photo-form card">
          <h3>Télécharger une photo de progression</h3>
          <form onSubmit={handleSubmit}>
            <div className="photo-upload-area">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                id="photo-input"
                style={{ display: 'none' }}
              />
              <label htmlFor="photo-input" className="upload-label">
                {preview ? (
                  <div className="preview-container">
                    <img src={preview} alt="Preview" className="preview-image" />
                    <button type="button" className="change-btn">Changer de photo</button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <div className="upload-icon">📸</div>
                    <p>Cliquez pour sélectionner une photo</p>
                    <small>PNG, JPG ou GIF (max 5MB)</small>
                  </div>
                )}
              </label>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Zone musculaire *</label>
                <select
                  name="muscle_focus"
                  value={formData.muscle_focus}
                  onChange={handleInputChange}
                >
                  {MUSCLE_FOCUS.map(focus => (
                    <option key={focus} value={focus}>{focus}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Poids actuel (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="Ex: 75.5"
                  step="0.1"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Séance associée (optionnel)</label>
              <select
                name="workout_id"
                value={formData.workout_id}
                onChange={handleInputChange}
              >
                <option value="">-- Aucune séance --</option>
                {workouts.map(workout => {
                  const daysOfWeek = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
                  const dayName = daysOfWeek[workout.day_of_week] || 'Jour ' + workout.day_of_week;
                  const date = new Date(workout.created_at).toLocaleDateString('fr-FR');
                  return (
                    <option key={workout.id} value={workout.id}>
                      {dayName} - Semaine {workout.week_number}/{workout.year} ({workout.exercise_count} exercices)
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Observations, progression..."
                rows="3"
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn btn-success">
                Télécharger
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setSelectedFile(null);
                  setPreview(null);
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : photos.length === 0 ? (
        <div className="empty-state">
          <p>Aucune photo de progression</p>
          <small>Téléchargez vos photos avant/après pour suivre votre transformation</small>
        </div>
      ) : (
        <div className="photos-grid">
          {photos.map(photo => (
            <div key={photo.id} className="photo-card">
              <div className="photo-image-container">
                {selectedPhotoId === photo.id && photo.photo_data ? (
                  <img
                    src={photo.photo_data}
                    alt="Progress"
                    className="photo-image"
                  />
                ) : (
                  <div className="photo-placeholder">
                    <div className="emoji-big">📸</div>
                  </div>
                )}
              </div>

              <div className="photo-info">
                <h4>{photo.muscle_focus}</h4>
                <div className="photo-meta">
                  <span className="date">
                    {new Date(photo.photo_date).toLocaleDateString('fr-FR')}
                  </span>
                  {photo.weight && <span className="weight">{photo.weight} kg</span>}
                </div>
                {photo.workout_id && photo.day_of_week !== undefined && (
                  <div className="workout-info-badge">
                    <small>
                      {(() => {
                        const daysOfWeek = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
                        const dayName = daysOfWeek[photo.day_of_week] || 'Jour ' + photo.day_of_week;
                        return `📅 ${dayName} - S${photo.week_number}/${photo.year}`;
                      })()}
                    </small>
                    {photo.exercise_count !== undefined && (
                      <small>🏋️ {photo.exercise_count} exercices</small>
                    )}
                  </div>
                )}
                {photo.notes && <p className="notes">{photo.notes}</p>}
              </div>

              <div className="photo-actions">
                <button
                  className={`btn btn-secondary btn-small ${selectedPhotoId === photo.id ? 'active' : ''}`}
                  onClick={() => setSelectedPhotoId(selectedPhotoId === photo.id ? null : photo.id)}
                >
                  {selectedPhotoId === photo.id ? '👁️ Masquer' : '👁️ Voir'}
                </button>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => handleDeletePhoto(photo.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProgressPhotos;
