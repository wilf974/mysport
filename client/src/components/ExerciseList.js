import React, { useState } from 'react';
import EXERCISES from '../data/exercises';
import './ExerciseList.css';

function ExerciseList({ exercises, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    muscle_group: '',
    difficulty: 'intermediate'
  });

  const muscleIcons = {
    'pectoraux': '🫀',
    'dos': '🔙',
    'épaules': '💪',
    'biceps': '💪',
    'triceps': '✋',
    'avant-bras': '✋',
    'jambes': '🦵',
    'fesses': '🍑',
    'abs': '⚽'
  };

  const difficulties = {
    'beginner': 'Débutant',
    'intermediate': 'Intermédiaire',
    'advanced': 'Avancé'
  };

  const uniqueMuscleGroups = [...new Set(EXERCISES.map(ex => ex.muscleGroup))].sort();

  const handleSelectExercise = (e) => {
    const selectedExercise = EXERCISES.find(ex => ex.id === parseInt(e.target.value));
    if (selectedExercise) {
      setFormData({
        name: selectedExercise.name,
        nameEn: selectedExercise.nameEn,
        description: '',
        muscle_group: selectedExercise.muscleGroup,
        difficulty: selectedExercise.difficulty
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name) {
      alert('Veuillez sélectionner un exercice');
      return;
    }

    if (editingId) {
      onUpdate(editingId, formData);
      setEditingId(null);
    } else {
      onAdd(formData);
    }

    setFormData({
      name: '',
      nameEn: '',
      description: '',
      muscle_group: '',
      difficulty: 'intermediate'
    });
    setShowForm(false);
  };

  const handleEdit = (exercise) => {
    setFormData({
      name: exercise.name,
      nameEn: exercise.nameEn || '',
      description: exercise.description || '',
      muscle_group: exercise.muscle_group,
      difficulty: exercise.difficulty || 'intermediate'
    });
    setEditingId(exercise.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      nameEn: '',
      description: '',
      muscle_group: '',
      difficulty: 'intermediate'
    });
  };

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ex.nameEn && ex.nameEn.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMuscle = !filterMuscle || ex.muscle_group === filterMuscle;
    return matchesSearch && matchesMuscle;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'badge-success';
      case 'intermediate':
        return 'badge-warning';
      case 'advanced':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  return (
    <div className="exercise-list">
      <div className="exercise-header">
        <h2>💪 Mes Exercices</h2>
        {!showForm && (
          <button className="btn-add" onClick={() => setShowForm(true)}>
            + Ajouter un exercice
          </button>
        )}
      </div>

      {showForm && (
        <div className="exercise-form">
          <h3>{editingId ? 'Modifier l\'exercice' : 'Ajouter un exercice'}</h3>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Sélectionner un exercice *</label>
                <select
                  onChange={handleSelectExercise}
                  defaultValue=""
                  disabled={editingId}
                >
                  <option value="">-- Choisir un exercice --</option>
                  {EXERCISES.map(ex => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.nameEn})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.name && (
              <div className="form-row">
                <div className="form-group">
                  <label>Nom (FR)</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled
                    placeholder="Nom de l'exercice"
                  />
                </div>

                <div className="form-group">
                  <label>Nom (EN)</label>
                  <input
                    type="text"
                    name="nameEn"
                    value={formData.nameEn}
                    onChange={handleInputChange}
                    disabled
                    placeholder="Exercise name"
                  />
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Groupe musculaire</label>
                <input
                  type="text"
                  value={formData.muscle_group}
                  disabled
                  placeholder="Groupe musculaire"
                />
              </div>

              <div className="form-group">
                <label>Difficulté</label>
                <select name="difficulty" value={formData.difficulty} onChange={handleInputChange}>
                  <option value="beginner">Débutant</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="advanced">Avancé</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Notes (optionnel)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Notes ou variantes..."
                rows="2"
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-save">
                {editingId ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="exercise-filters">
        <input
          type="text"
          className="search-input"
          placeholder="Rechercher un exercice..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={filterMuscle}
          onChange={(e) => setFilterMuscle(e.target.value)}
        >
          <option value="">Tous les groupes</option>
          {uniqueMuscleGroups.map(group => (
            <option key={group} value={group}>
              {muscleIcons[group]} {group.charAt(0).toUpperCase() + group.slice(1)}
            </option>
          ))}
        </select>
        <span className="result-count">{filteredExercises.length} exercice(s)</span>
      </div>

      <div className="exercises-grid">
        {filteredExercises.length === 0 ? (
          <div className="empty-state">
            <p>Aucun exercice trouvé. Ajoute un exercice pour commencer!</p>
          </div>
        ) : (
          filteredExercises.map(exercise => (
            <div key={exercise.id} className="exercise-card">
              <div className="card-top">
                <div className="card-header">
                  <div className="exercise-title-wrapper">
                    <h3>{exercise.name}</h3>
                    <p className="exercise-subtitle">{exercise.nameEn}</p>
                  </div>
                  <button
                    className="menu-button"
                    onClick={() => setOpenMenuId(openMenuId === exercise.id ? null : exercise.id)}
                  >
                    ⋮
                  </button>
                  {openMenuId === exercise.id && (
                    <div className="action-menu">
                      <button
                        className="menu-item edit"
                        onClick={() => {
                          handleEdit(exercise);
                          setOpenMenuId(null);
                        }}
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        className="menu-item delete"
                        onClick={() => {
                          if (window.confirm('Supprimer cet exercice ?')) {
                            onDelete(exercise.id);
                            setOpenMenuId(null);
                          }
                        }}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="exercise-meta">
                <span className={`badge-muscle`}>
                  {muscleIcons[exercise.muscle_group]} {exercise.muscle_group.charAt(0).toUpperCase() + exercise.muscle_group.slice(1)}
                </span>
                <span className={`badge-difficulty ${getDifficultyColor(exercise.difficulty)}`}>
                  {difficulties[exercise.difficulty]}
                </span>
              </div>

              {exercise.description && (
                <p className="exercise-description">{exercise.description}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ExerciseList;
