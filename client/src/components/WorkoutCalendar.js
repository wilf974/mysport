import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WorkoutCalendar.css';
import WorkoutModal from './WorkoutModal';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DAYS_OF_WEEK = [
  { id: 0, name: 'Lundi' },
  { id: 1, name: 'Mardi' },
  { id: 2, name: 'Mercredi' },
  { id: 3, name: 'Jeudi' },
  { id: 4, name: 'Vendredi' },
  { id: 5, name: 'Samedi' },
  { id: 6, name: 'Dimanche' }
];

function WorkoutCalendar({ userId, exercises }) {
  const [workouts, setWorkouts] = useState({});
  const [currentWeek, setCurrentWeek] = useState(getWeekNumber(new Date()));
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasTemplates, setHasTemplates] = useState(false);

  useEffect(() => {
    fetchWorkouts();
    checkTemplates();
  }, [currentWeek, currentYear]);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/workouts/${userId}/${currentWeek}/${currentYear}`);
      const workoutsByDay = {};
      for (const workout of response.data) {
        workoutsByDay[workout.day_of_week] = workout;
      }
      setWorkouts(workoutsByDay);
    } catch (err) {
      console.error('Erreur lors du chargement des entraînements:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkTemplates = async () => {
    try {
      const response = await axios.get(`${API_URL}/templates/check/${userId}`);
      setHasTemplates(response.data.hasTemplates);
    } catch (err) {
      console.error('Erreur vérification modèles:', err);
    }
  };

  const handleSaveWeekAsTemplate = async () => {
    if (!window.confirm("Voulez-vous définir cette semaine comme votre semaine type ? Cela écrasera l'ancien modèle.")) return;
    try {
      await axios.post(`${API_URL}/templates/save-week`, {
        user_id: userId,
        week: currentWeek,
        year: currentYear
      });
      alert("Semaine type sauvegardée !");
      setHasTemplates(true);
    } catch (err) {
      console.error('Erreur sauvegarde modèle:', err);
      alert("Erreur lors de la sauvegarde.");
    }
  };

  const handleApplyTemplate = async () => {
    if (!window.confirm("Voulez-vous appliquer la semaine type à cette semaine ?")) return;
    try {
      await axios.post(`${API_URL}/templates/apply`, {
        user_id: userId,
        week: currentWeek,
        year: currentYear
      });
      fetchWorkouts();
    } catch (err) {
      console.error('Erreur application modèle:', err);
      alert("Erreur lors de l'application du modèle.");
    }
  };

  const handleAddWorkout = async (dayOfWeek, duration = null) => {
    try {
      const response = await axios.post(`${API_URL}/workouts`, {
        user_id: userId,
        day_of_week: dayOfWeek,
        week_number: currentWeek,
        year: currentYear,
        duration: duration
      });
      setWorkouts({
        ...workouts,
        [dayOfWeek]: response.data
      });
      setShowModal(false);
    } catch (err) {
      console.error('Erreur lors de la création de l\'entraînement:', err);
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet entraînement ?')) return;

    try {
      await axios.delete(`${API_URL}/workouts/${workoutId}`);
      const newWorkouts = { ...workouts };
      delete newWorkouts[selectedDay];
      setWorkouts(newWorkouts);
      setShowModal(false);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  const handleValidateSession = async (e, workoutId, currentStatus) => {
    e.stopPropagation(); // Prevent opening modal
    try {
      await axios.put(`${API_URL}/workouts/${workoutId}`, {
        completed: !currentStatus
      });

      // Update local state
      const updatedWorkouts = { ...workouts };
      // Find the day for this workout
      const day = Object.keys(updatedWorkouts).find(key => updatedWorkouts[key].id === workoutId);
      if (day) {
        updatedWorkouts[day] = { ...updatedWorkouts[day], completed: !currentStatus };
        setWorkouts(updatedWorkouts);
      }
    } catch (err) {
      console.error('Erreur validation séance:', err);
    }
  };

  const previousWeek = () => {
    if (currentWeek === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentWeek(52);
    } else {
      setCurrentWeek(currentWeek - 1);
    }
  };

  const nextWeek = () => {
    if (currentWeek === 52) {
      setCurrentYear(currentYear + 1);
      setCurrentWeek(1);
    } else {
      setCurrentWeek(currentWeek + 1);
    }
  };

  const openDayModal = (day) => {
    setSelectedDay(day);
    setShowModal(true);
  };

  // Helper to get date for a specific day in the current week
  const getDateForDay = (dayIndex) => {
    const d = getDateOfISOWeek(currentWeek, currentYear);
    // getDateOfISOWeek returns Monday. Adjust for dayIndex (0=Monday, 6=Sunday in our array, but standard JS is 0=Sunday)
    // Our DAYS_OF_WEEK: 0=Lundi, 1=Mardi...
    const dayDate = new Date(d);
    dayDate.setDate(d.getDate() + dayIndex);
    return dayDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="workout-calendar">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={previousWeek}>← Semaine précédente</button>
        <h2>Semaine {currentWeek} - {currentYear}</h2>
        <button className="calendar-nav-btn" onClick={nextWeek}>Semaine suivante →</button>
      </div>

      <div className="template-actions">
        {hasTemplates && (
          <button className="btn-template-apply" onClick={handleApplyTemplate}>
            ⚡ Appliquer semaine type
          </button>
        )}
        <button className="btn-template-save" onClick={handleSaveWeekAsTemplate}>
          💾 Sauvegarder comme modèle
        </button>
      </div>

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : (
        <div className="calendar-grid">
          {DAYS_OF_WEEK.map(day => {
            const workout = workouts[day.id];
            const isCompleted = workout?.completed;

            return (
              <div
                key={day.id}
                className={`day-card ${workout ? 'has-workout' : ''} ${isCompleted ? 'completed-session' : ''}`}
                onClick={() => openDayModal(day.id)}
              >
                <div className="day-header">
                  <h3>{day.name}</h3>
                  <span className="day-date">{getDateForDay(day.id)}</span>
                </div>

                {workout ? (
                  <div className="workout-info">
                    <div className="workout-status-bar">
                      <div className={`badge ${isCompleted ? 'badge-success' : 'badge-primary'}`}>
                        {isCompleted ? '✅ Validé' : 'Planifié'}
                      </div>
                      <button
                        className={`btn-validate-mini ${isCompleted ? 'active' : ''}`}
                        onClick={(e) => handleValidateSession(e, workout.id, isCompleted)}
                        title={isCompleted ? "Marquer comme non fait" : "Valider la séance"}
                      >
                        {isCompleted ? '↩' : '✓'}
                      </button>
                    </div>
                    <WorkoutDayExercises
                      workoutId={workout.id}
                      userId={userId}
                    />
                  </div>
                ) : (
                  <div className="no-workout">
                    <p>Repos</p>
                    <button className="btn-add-mini" title="Ajouter un entraînement">+</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <WorkoutModal
          day={DAYS_OF_WEEK.find(d => d.id === selectedDay)}
          workout={workouts[selectedDay]}
          userId={userId}
          exercises={exercises}
          onAdd={(duration) => handleAddWorkout(selectedDay, duration)}
          onDelete={() => handleDeleteWorkout(workouts[selectedDay].id)}
          onClose={() => setShowModal(false)}
          onWorkoutUpdate={fetchWorkouts}
        />
      )}
    </div>
  );
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getDateOfISOWeek(w, y) {
  var simple = new Date(y, 0, 1 + (w - 1) * 7);
  var dow = simple.getDay();
  var ISOweekStart = simple;
  if (dow <= 4)
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
}

function WorkoutDayExercises({ workoutId, userId }) {
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await axios.get(`${API_URL}/workout-exercises/${workoutId}`);
        setExercises(response.data);
      } catch (err) {
        console.error('Erreur:', err);
      }
    };
    fetchExercises();
  }, [workoutId]);

  return (
    <div className="exercises-list">
      {exercises.slice(0, 3).map(ex => (
        <div key={ex.id} className="exercise-item">
          <span className="exercise-name">{ex.name}</span>
          <span className="exercise-sets">{ex.sets}x{ex.reps}</span>
        </div>
      ))}
      {exercises.length > 3 && <span className="more-exercises">+{exercises.length - 3} autres</span>}
    </div>
  );
}

export default WorkoutCalendar;
