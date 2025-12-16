import React, { useState } from 'react';
import './ExerciseList.css';

function ExerciseList({ exercises, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    muscle_group: 'Poitrine',
    difficulty: 'intermediate'
  });

  const muscleGroups = [
    'Poitrine', 'Dos', 'Épaules', 'Bras', 'Avant-bras',
    'Jambes', 'Quadriceps', 'Ischio-jambiers', 'Mollets', 'Abdominaux',
    'Fessiers', 'Corps entier'
  ];

  const muscleIcons = {
    'Poitrine': '🫀',
    'Dos': '🔙',
    'Épaules': '💪',
    'Bras': '💪',
    'Avant-bras': '✋',
    'Jambes': '🦵',
    'Quadriceps': '🦵',
    'Ischio-jambiers': '🦵',
    'Mollets': '🦵',
    'Abdominaux': '⚽',
    'Fessiers': '🍑',
    'Corps entier': '🧘'
  };

  const difficulties = ['Débutant', 'Intermédiaire', 'Avancé'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      onUpdate(editingId, formData);
      setEditingId(null);
    } else {
      onAdd(formData);
    }

    setFormData({
      name: '',
      description: '',
      muscle_group: 'Poitrine',
      difficulty: 'intermediate'
    });
    setShowForm(false);
  };

  const handleEdit = (exercise) => {
    setFormData({
      name: exercise.name,
      description: exercise.description || '',
      muscle_group: exercise.muscle_group || 'Poitrine',
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
      description: '',
      muscle_group: 'Poitrine',
      difficulty: 'intermediate'
    });
  };

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = !filterMuscle || ex.muscle_group === filterMuscle;
    return matchesSearch && matchesMuscle;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Débutant':
        return 'badge-success';
      case 'Intermédiaire':
        return 'badge-warning';
      case 'Avancé':
        return 'badge-danger';
      default:
        return '';
    }
  };

  return (
    <div className="exercise-list">
      <div className="exercise-header">
        <h2>💪 Gestion des Exercices</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Annuler' : '+ Ajouter un exercice'}
        </button>
      </div>

      {showForm && (
        <div className="exercise-form card">
          <h3>{editingId ? 'Modifier l\'exercice' : 'Nouvel exercice'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nom de l'exercice *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ex: Développé couché"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Détails sur l'exercice..."
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Groupe musculaire *</label>
                <select
                  name="muscle_group"
                  value={formData.muscle_group}
                  onChange={handleInputChange}
                  required
                >
                  {muscleGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Difficulté *</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                >
                  {difficulties.map(diff => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn btn-success">
                {editingId ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="exercise-filters card">
        <input
          type="text"
          placeholder="🔍 Rechercher un exercice..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filterMuscle}
          onChange={(e) => setFilterMuscle(e.target.value)}
          className="filter-select"
        >
          <option value="">Tous les groupes musculaires</option>
          {muscleGroups.map(group => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>

        <span className="result-count">
          {filteredExercises.length} exercice{filteredExercises.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filteredExercises.length === 0 ? (
        <div className="empty-state">
          <p>Aucun exercice trouvé</p>
        </div>
      ) : (
        <>
          {/* Grid view for desktop */}
          <div className="exercises-grid">
            {filteredExercises.map(exercise => (
              <div key={exercise.id} className="exercise-card">
                <div className="card-top">
                  <div className="card-header">
                    <div className="exercise-title-wrapper">
                      <h3>{exercise.name}</h3>
                      <span className={`badge ${getDifficultyColor(exercise.difficulty)}`}>
                        {exercise.difficulty}
                      </span>
                    </div>
                    <button
                      className="menu-button"
                      onClick={() => setOpenMenuId(openMenuId === exercise.id ? null : exercise.id)}
                      aria-label="Options"
                    >
                      ⋮
                    </button>
                  </div>

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
                          if (window.confirm('Êtes-vous sûr de vouloir supprimer cet exercice ?')) {
                            onDelete(exercise.id);
                          }
                          setOpenMenuId(null);
                        }}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  )}
                </div>

                {exercise.description && (
                  <p className="exercise-description">{exercise.description}</p>
                )}

                <div className="exercise-meta">
                  <span className="badge badge-muscle">
                    {muscleIcons[exercise.muscle_group]} {exercise.muscle_group}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* List view for mobile */}
          <div className="exercises-list">
            {filteredExercises.map(exercise => (
              <div key={exercise.id} className="exercise-item">
                <div className="exercise-item-content">
                  <h4 className="exercise-item-title">{exercise.name}</h4>
                  <div className="exercise-item-meta">
                    <span className={`badge badge-sm ${getDifficultyColor(exercise.difficulty)}`}>
                      {exercise.difficulty}
                    </span>
                    <span className="badge badge-sm badge-muscle">
                      {muscleIcons[exercise.muscle_group]}
                    </span>
                  </div>
                </div>
                <div className="exercise-item-menu">
                  <button
                    className="menu-button"
                    onClick={() => setOpenMenuId(openMenuId === exercise.id ? null : exercise.id)}
                    aria-label="Options"
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
                          if (window.confirm('Êtes-vous sûr de vouloir supprimer cet exercice ?')) {
                            onDelete(exercise.id);
                          }
                          setOpenMenuId(null);
                        }}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ExerciseList;
