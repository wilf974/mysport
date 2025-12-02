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

  useEffect(() => {
    fetchWorkouts();
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

  const handleAddWorkout = async (dayOfWeek) => {
    try {
      const response = await axios.post(`${API_URL}/workouts`, {
        user_id: userId,
        day_of_week: dayOfWeek,
        week_number: currentWeek,
        year: currentYear
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

  return (
    <div className="workout-calendar">
      <div className="calendar-header">
        <button className="btn btn-secondary" onClick={previousWeek}>← Semaine précédente</button>
        <h2>Semaine {currentWeek} - {currentYear}</h2>
        <button className="btn btn-secondary" onClick={nextWeek}>Semaine suivante →</button>
      </div>

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : (
        <div className="calendar-grid">
          {DAYS_OF_WEEK.map(day => (
            <div
              key={day.id}
              className={`day-card ${workouts[day.id] ? 'has-workout' : ''}`}
              onClick={() => openDayModal(day.id)}
            >
              <h3>{day.name}</h3>
              {workouts[day.id] ? (
                <div className="workout-info">
                  <div className="badge badge-success">Entraînement planifié</div>
                  <WorkoutDayExercises
                    workoutId={workouts[day.id].id}
                    userId={userId}
                  />
                </div>
              ) : (
                <div className="no-workout">
                  <p>Aucun entraînement</p>
                  <button className="btn btn-primary btn-small">Ajouter</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <WorkoutModal
          day={DAYS_OF_WEEK.find(d => d.id === selectedDay)}
          workout={workouts[selectedDay]}
          userId={userId}
          exercises={exercises}
          onAdd={() => handleAddWorkout(selectedDay)}
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
