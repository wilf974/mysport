import React, { useState, useEffect, Suspense, lazy } from 'react';
import axios from 'axios';
import '../App.css';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import Header from './Header';
import LoadingSpinner from './LoadingSpinner';

// Code splitting: charger les composants d'onglet de manière asynchrone
const WorkoutCalendar = lazy(() => import('./WorkoutCalendar'));
const ExerciseList = lazy(() => import('./ExerciseList'));
const ProgressPhotos = lazy(() => import('./ProgressPhotos'));
const Measurements = lazy(() => import('./Measurements'));
const Statistics = lazy(() => import('./Statistics'));
const Nutrition = lazy(() => import('./Nutrition'));
const RecoveryTracker = lazy(() => import('./RecoveryTracker'));
const MonthlyGoals = lazy(() => import('./MonthlyGoals'));
const HealthDashboard = lazy(() => import('./HealthDashboard'));

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Dashboard() {
  // Initialize theme management
  useTheme();

  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('calendar');
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Charger les exercices
  useEffect(() => {
    if (user?.id) {
      fetchExercises();
    }
  }, [user?.id]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/exercises/${user.id}`);
      setExercises(response.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des exercices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = async (exerciseData) => {
    try {
      const response = await axios.post(`${API_URL}/exercises`, {
        user_id: user.id,
        ...exerciseData
      });
      setExercises([...exercises, response.data]);
      setError('');
    } catch (err) {
      setError('Erreur lors de l\'ajout de l\'exercice');
      console.error(err);
    }
  };

  const handleUpdateExercise = async (id, exerciseData) => {
    try {
      const response = await axios.put(`${API_URL}/exercises/${id}`, exerciseData);
      setExercises(exercises.map(ex => ex.id === id ? response.data : ex));
      setError('');
    } catch (err) {
      setError('Erreur lors de la mise à jour de l\'exercice');
      console.error(err);
    }
  };

  const handleDeleteExercise = async (id) => {
    try {
      await axios.delete(`${API_URL}/exercises/${id}`);
      setExercises(exercises.filter(ex => ex.id !== id));
      setError('');
    } catch (err) {
      setError('Erreur lors de la suppression de l\'exercice');
      console.error(err);
    }
  };

  return (
    <div className="app">
      <Header />

      {error && <div className="error">{error}</div>}

      <nav className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          📅 Planning
        </button>
        <button
          className={`tab-btn ${activeTab === 'exercises' ? 'active' : ''}`}
          onClick={() => setActiveTab('exercises')}
        >
          💪 Exercices
        </button>
        <button
          className={`tab-btn ${activeTab === 'nutrition' ? 'active' : ''}`}
          onClick={() => setActiveTab('nutrition')}
        >
          🍏 Nutrition
        </button>
        <button
          className={`tab-btn ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          🎯 Objectifs
        </button>
        <button
          className={`tab-btn ${activeTab === 'photos' ? 'active' : ''}`}
          onClick={() => setActiveTab('photos')}
        >
          📸 Photos
        </button>
        <button
          className={`tab-btn ${activeTab === 'measurements' ? 'active' : ''}`}
          onClick={() => setActiveTab('measurements')}
        >
          📏 Mesures
        </button>
        <button
          className={`tab-btn ${activeTab === 'recovery' ? 'active' : ''}`}
          onClick={() => setActiveTab('recovery')}
        >
          🔋 Forme
        </button>
        <button
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Stats
        </button>
        <button
          className={`tab-btn ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => setActiveTab('health')}
        >
          🏥 Santé
        </button>
      </nav>

      <div className="container">
        <Suspense fallback={<LoadingSpinner message="Chargement du contenu..." />}>
          {loading && activeTab === 'calendar' ? (
            <LoadingSpinner message="Chargement des exercices..." />
          ) : (
            <>
              {activeTab === 'calendar' && (
                <WorkoutCalendar userId={user.id} exercises={exercises} />
              )}
              {activeTab === 'exercises' && (
                <ExerciseList
                  exercises={exercises}
                  onAdd={handleAddExercise}
                  onUpdate={handleUpdateExercise}
                  onDelete={handleDeleteExercise}
                />
              )}
              {activeTab === 'nutrition' && (
                <Nutrition userId={user.id} />
              )}
              {activeTab === 'goals' && (
                <MonthlyGoals userId={user.id} />
              )}
              {activeTab === 'photos' && (
                <ProgressPhotos userId={user.id} />
              )}
              {activeTab === 'measurements' && (
                <Measurements userId={user.id} />
              )}
              {activeTab === 'recovery' && (
                <RecoveryTracker userId={user.id} />
              )}
              {activeTab === 'stats' && (
                <Statistics userId={user.id} />
              )}
              {activeTab === 'health' && (
                <HealthDashboard />
              )}
            </>
          )}
        </Suspense>
      </div>
    </div>
  );
}

export default Dashboard;
