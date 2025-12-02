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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

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
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setSelectedFiles(prev => [...prev, ...files]);
    const newPreviews = [];

    let loaded = 0;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        loaded++;
        if (loaded === files.length) {
          setPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
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

    if (selectedFiles.length === 0) {
      alert('Veuillez sélectionner au moins une photo');
      return;
    }

    try {
      setLoading(true);
      const newPhotos = [];

      // Find the selected workout if one was chosen
      const selectedWorkout = formData.workout_id
        ? workouts.find(w => w.id === parseInt(formData.workout_id))
        : null;

      // Upload each file
      for (let i = 0; i < previews.length; i++) {
        const photoData = previews[i];

        try {
          const response = await axios.post(`${API_URL}/progress-photos`, {
            user_id: userId,
            photo_data: photoData,
            muscle_focus: formData.muscle_focus,
            weight: formData.weight ? parseFloat(formData.weight) : null,
            notes: formData.notes,
            workout_id: formData.workout_id ? parseInt(formData.workout_id) : null
          });

          const newPhoto = {
            ...response.data,
            photo_date: new Date().toISOString(),
            photo_data: photoData,
            ...(selectedWorkout && {
              day_of_week: selectedWorkout.day_of_week,
              week_number: selectedWorkout.week_number,
              year: selectedWorkout.year,
              workout_date: selectedWorkout.created_at,
              exercise_count: selectedWorkout.exercise_count
            })
          };

          newPhotos.push(newPhoto);
          setUploadProgress(Math.round(((i + 1) / previews.length) * 100));
        } catch (err) {
          console.error(`Erreur lors du téléchargement de la photo ${i + 1}:`, err);
        }
      }

      // Add all new photos at once
      setPhotos([...newPhotos, ...photos]);
      setShowForm(false);
      setSelectedFiles([]);
      setPreviews([]);
      setUploadProgress(0);
      setFormData({
        muscle_focus: 'Corps entier',
        weight: '',
        notes: '',
        workout_id: ''
      });

      alert(`${newPhotos.length} photo(s) téléchargée(s) avec succès !`);
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors du téléchargement des photos');
    } finally {
      setLoading(false);
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
          {showForm ? '✕ Annuler' : '+ Ajouter des photos'}
        </button>
      </div>

      {showForm && (
        <div className="photo-form card">
          <h3>Télécharger des photos de progression</h3>
          <form onSubmit={handleSubmit}>
            <div className="photo-upload-area">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                id="photo-input"
                style={{ display: 'none' }}
              />
              <label htmlFor="photo-input" className="upload-label">
                {previews.length === 0 ? (
                  <div className="upload-placeholder">
                    <div className="upload-icon">📸</div>
                    <p>Cliquez pour sélectionner des photos</p>
                    <small>PNG, JPG ou GIF - Sélectionnez plusieurs fichiers</small>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <div className="upload-icon">➕</div>
                    <p>Cliquez pour ajouter d'autres photos</p>
                    <small>{previews.length} photo(s) sélectionnée(s)</small>
                  </div>
                )}
              </label>
            </div>

            {previews.length > 0 && (
              <div className="photo-previews-grid">
                {previews.map((preview, index) => (
                  <div key={index} className="preview-item">
                    <img src={preview} alt={`Preview ${index + 1}`} className="preview-thumbnail" />
                    <button
                      type="button"
                      className="btn btn-danger btn-small remove-btn"
                      onClick={() => handleRemoveFile(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {loading && uploadProgress > 0 && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <small>{uploadProgress}% - {previews.length} photo(s)</small>
              </div>
            )}

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
              <button
                type="submit"
                className="btn btn-success"
                disabled={selectedFiles.length === 0 || loading}
              >
                {loading ? 'Téléchargement...' : 'Télécharger'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setSelectedFiles([]);
                  setPreviews([]);
                  setUploadProgress(0);
                }}
                disabled={loading}
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
