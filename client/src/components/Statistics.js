import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Statistics.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Statistics({ userId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

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
        <h3>📈 Astuces pour progresser</h3>
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
