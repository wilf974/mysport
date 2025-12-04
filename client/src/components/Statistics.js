import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ProgressChart from './ProgressChart';
import './Statistics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Statistics({ userId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Progression chart states
  const [exercises, setExercises] = useState([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [progressionData, setProgressionData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);

  // Comparison & Volume states
  const [comparisonData, setComparisonData] = useState(null);
  const [volumeData, setVolumeData] = useState(null);
  const [streakData, setStreakData] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchExercises();
    fetchVolumeData();
    fetchStreakData();
  }, []);

  useEffect(() => {
    if (selectedExerciseId) {
      fetchProgressionData(selectedExerciseId);
      fetchComparisonData(selectedExerciseId);
    }
  }, [selectedExerciseId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/stats/${userId}`);
      setStats(response.data);
      setError('');
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const fetchStreakData = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats/streak/${userId}`);
      setStreakData(response.data);
    } catch (err) {
      console.error('Erreur streak:', err);
    }
  };

  const fetchExercises = async () => {
    try {
      const response = await axios.get(`${API_URL}/exercises/${userId}`);
      setExercises(response.data);
      if (response.data.length > 0) {
        setSelectedExerciseId(response.data[0].id);
      }
    } catch (err) {
      console.error('Erreur chargement exercices:', err);
    }
  };

  const fetchProgressionData = async (exerciseId) => {
    try {
      setChartLoading(true);
      const response = await axios.get(`${API_URL}/stats/progression/${userId}/${exerciseId}`);
      setProgressionData(response.data);
    } catch (err) {
      console.error('Erreur chargement progression:', err);
    } finally {
      setChartLoading(false);
    }
  };

  const fetchComparisonData = async (exerciseId) => {
    try {
      const response = await axios.get(`${API_URL}/stats/comparison/${userId}/${exerciseId}`);
      setComparisonData(response.data);
    } catch (err) {
      console.error('Erreur comparaison:', err);
    }
  };

  const fetchVolumeData = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats/volume/${userId}`);
      setVolumeData(response.data);
    } catch (err) {
      console.error('Erreur volume:', err);
    }
  };

  const handleExerciseChange = (e) => {
    setSelectedExerciseId(e.target.value);
  };

  const getSelectedExerciseName = () => {
    const ex = exercises.find(e => e.id.toString() === selectedExerciseId.toString());
    return ex ? ex.name : '';
  };

  const analyzeProgression = (data) => {
    if (!data || data.length < 2) return { trend: 0, isStagnating: false };

    const last = data[data.length - 1];
    const previous = data[data.length - 2];

    let trend = 0;
    if (previous.weight > 0) {
      trend = ((last.weight - previous.weight) / previous.weight) * 100;
    }

    let isStagnating = false;
    if (data.length >= 3) {
      const last3 = data.slice(-3);
      const weight = last3[0].weight;
      isStagnating = last3.every(d => Math.abs(d.weight - weight) < 0.1);
    }

    return {
      trend: parseFloat(trend.toFixed(1)),
      isStagnating
    };
  };

  const volumeChartData = {
    labels: volumeData?.map(d => d.muscle_group) || [],
    datasets: [
      {
        label: 'Volume total (kg)',
        data: volumeData?.map(d => d.total_volume) || [],
        backgroundColor: 'rgba(79, 70, 229, 0.6)',
        borderRadius: 4,
      },
    ],
  };

  const volumeChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Volume par groupe musculaire (30 jours)' },
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  if (loading) {
    return <div className="loading">Chargement des statistiques...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!stats) {
    return <div className="empty-state">Aucune statistique disponible</div>;
  }

  return (
    <div className="statistics">
      <h2>📊 Statistiques et Progression</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>Série en cours</h3>
            <div className="stat-value">{streakData?.currentStreak || 0}</div>
            <p className="stat-label">Jours consécutifs</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💪</div>
          <div className="stat-content">
            <h3>Entraînements effectués</h3>
            <div className="stat-value">{stats.total_workouts}</div>
            <p className="stat-label">Séances complétées</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🥇</div>
          <div className="stat-content">
            <h3>Records personnels</h3>
            <div className="stat-value">{stats.personal_records?.length || 0}</div>
            <p className="stat-label">Exercices avec PR</p>
          </div>
        </div>
      </div>

      <div className="progression-section card">
        <div className="section-header">
          <h3>📈 Graphique de Progression</h3>
          <div className="exercise-selector">
            <select
              value={selectedExerciseId}
              onChange={handleExerciseChange}
              className="form-control"
            >
              {exercises.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </div>
        </div>

        {chartLoading ? (
          <div className="loading-chart">Chargement du graphique...</div>
        ) : (
          <>
            <ProgressChart
              data={progressionData}
              exerciseName={getSelectedExerciseName()}
            />
            {progressionData.length >= 2 && (
              <div className="progression-analysis">
                {(() => {
                  const analysis = analyzeProgression(progressionData);
                  return (
                    <>
                      <div className={`analysis-card ${analysis.trend >= 0 ? 'positive' : 'negative'}`}>
                        <span className="analysis-label">Tendance</span>
                        <span className="analysis-value">
                          {analysis.trend > 0 ? '+' : ''}{analysis.trend}%
                        </span>
                      </div>

                      {analysis.isStagnating && (
                        <div className="analysis-card warning">
                          <span className="analysis-label">⚠️ Stagnation détectée</span>
                          <span className="analysis-desc">
                            Charge stable sur les 3 dernières séances.
                            Essayez d'augmenter le poids ou les répétitions !
                          </span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
            {/* Comparison Section */}
            {comparisonData && !comparisonData.message && (
              <div className="comparison-section">
                <h4>Comparaison avec votre meilleur niveau</h4>
                <div className="comparison-grid">
                  <div className="comparison-card">
                    <span className="comp-label">Dernière séance</span>
                    <span className="comp-value">{comparisonData.current.weight} kg</span>
                    <span className="comp-sub">x {comparisonData.current.reps} reps</span>
                  </div>
                  <div className="comparison-card highlight">
                    <span className="comp-label">Record (PR)</span>
                    <span className="comp-value">{comparisonData.best_weight.weight} kg</span>
                    <span className="comp-sub">le {new Date(comparisonData.best_weight.date).toLocaleDateString()}</span>
                  </div>
                  <div className="comparison-card">
                    <span className="comp-label">Volume Max</span>
                    <span className="comp-value">{comparisonData.best_volume.volume}</span>
                    <span className="comp-sub">kg total</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Volume Chart */}
      {volumeData && volumeData.length > 0 && (
        <div className="volume-section card">
          <h3>🏋️ Volume par Muscle (30 derniers jours)</h3>
          <div className="volume-chart-container">
            <Bar options={volumeChartOptions} data={volumeChartData} />
          </div>
        </div>
      )}

      {stats.personal_records && stats.personal_records.length > 0 && (
        <div className="personal-records card">
          <h3>🏆 Records Personnels (Poids Max)</h3>
          <div className="prs-list">
            {stats.personal_records.map((pr, index) => (
              <div key={index} className="pr-item">
                <div className="pr-rank">#{index + 1}</div>
                <div className="pr-details">
                  <h4>{pr.name}</h4>
                  <span className="pr-reps">{pr.reps} reps</span>
                </div>
                <div className="pr-weight">
                  <span className="weight-value">{pr.max_weight}</span>
                  <span className="weight-unit">kg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stats-info card">
        <h3>💡 Astuces pour progresser</h3>
        <ul className="tips-list">
          <li>✅ Enregistrez vos mesures régulièrement pour suivre votre progression</li>
          <li>✅ Augmentez progressivement le poids ou les répétitions (progression surcharge)</li>
          <li>✅ Maintenez une constance: au moins 3-4 entraînements par semaine</li>
          <li>✅ Prenez des photos tous les mois pour voir les changements physiques</li>
          <li>✅ Variez vos exercices pour stimuler tous les groupes musculaires</li>
          <li>✅ Notez vos observations pour optimiser vos entraînements</li>
        </ul>
      </div>
    </div>
  );
}

export default Statistics;
