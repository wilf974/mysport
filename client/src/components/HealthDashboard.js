import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../utils/apiClient';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import './HealthDashboard.css';

function HealthDashboard() {
  const { user } = useAuth();
  const [wearablesStatus, setWearablesStatus] = useState({
    googleFit: false,
    strava: false,
    lastSyncGoogleFit: null,
    lastSyncStrava: null
  });
  const [healthData, setHealthData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState({ googleFit: false, strava: false });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchWearablesStatus();
      fetchHealthData();
      fetchActivities();
    }
  }, [user?.id]);

  const fetchWearablesStatus = async () => {
    try {
      const response = await axiosInstance.get('/wearables/status');
      setWearablesStatus(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement du statut:', err);
    }
  };

  const fetchHealthData = async () => {
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const response = await axiosInstance.get('/wearables/health-data', {
        params: { startDate, endDate }
      });

      // Group data by date and type
      const groupedData = {};
      response.data.forEach(item => {
        const date = new Date(item.timestamp).toLocaleDateString('fr-FR');
        if (!groupedData[date]) {
          groupedData[date] = { date };
        }
        groupedData[date][item.data_type] = item.value;
      });

      setHealthData(Object.values(groupedData).sort((a, b) => new Date(a.date) - new Date(b.date)));
    } catch (err) {
      console.error('Erreur lors du chargement des données de santé:', err);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await axiosInstance.get('/wearables/activities');
      setActivities(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des activités:', err);
    }
  };

  const handleGoogleFitConnect = async () => {
    try {
      const response = await axiosInstance.get('/oauth/google/url');
      window.location.href = response.data.authUrl;
    } catch (err) {
      setError('Erreur lors de la connexion à Google Fit');
      console.error(err);
    }
  };

  const handleStravaConnect = async () => {
    try {
      const response = await axiosInstance.get('/oauth/strava/url');
      window.location.href = response.data.authUrl;
    } catch (err) {
      setError('Erreur lors de la connexion à Strava');
      console.error(err);
    }
  };

  const handleSyncGoogleFit = async () => {
    setSyncing(prev => ({ ...prev, googleFit: true }));
    try {
      await axiosInstance.post('/wearables/sync/google-fit');
      fetchHealthData();
      fetchWearablesStatus();
    } catch (err) {
      setError('Erreur lors de la synchronisation Google Fit');
      console.error(err);
    } finally {
      setSyncing(prev => ({ ...prev, googleFit: false }));
    }
  };

  const handleSyncStrava = async () => {
    setSyncing(prev => ({ ...prev, strava: true }));
    try {
      await axiosInstance.post('/wearables/sync/strava');
      fetchActivities();
      fetchWearablesStatus();
    } catch (err) {
      setError('Erreur lors de la synchronisation Strava');
      console.error(err);
    } finally {
      setSyncing(prev => ({ ...prev, strava: false }));
    }
  };

  const formatActivityType = (type) => {
    const types = {
      run: '🏃 Course',
      ride: '🚴 Vélo',
      swim: '🏊 Natation',
      walk: '🚶 Marche',
      hike: '🥾 Randonnée',
      cycling: '🚴 Cyclisme'
    };
    return types[type] || `📍 ${type}`;
  };

  const formatDistance = (meters) => {
    if (meters >= 1000) {
      return (meters / 1000).toFixed(2) + ' km';
    }
    return meters.toFixed(0) + ' m';
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="health-dashboard">
      <div className="dashboard-header">
        <h1>🏥 Santé & Performances</h1>
        <p>Synchronisez vos données de santé depuis votre montre connectée</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Wearables Connection Section */}
      <div className="wearables-section">
        <h2>📱 Connexions</h2>
        <div className="wearables-grid">
          <div className="wearable-card">
            <div className="wearable-header">
              <span className="wearable-icon">🔴</span>
              <span className="wearable-name">Google Fit</span>
              <span className={`status-badge ${wearablesStatus.googleFit ? 'connected' : 'disconnected'}`}>
                {wearablesStatus.googleFit ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>
            <p className="wearable-description">Synchronisez vos données de fréquence cardiaque, pas et calories</p>
            {!wearablesStatus.googleFit ? (
              <button className="btn-connect" onClick={handleGoogleFitConnect}>
                Connecter Google Fit
              </button>
            ) : (
              <button
                className="btn-sync"
                onClick={handleSyncGoogleFit}
                disabled={syncing.googleFit}
              >
                {syncing.googleFit ? 'Synchronisation...' : 'Synchroniser maintenant'}
              </button>
            )}
            {wearablesStatus.lastSyncGoogleFit && (
              <p className="last-sync">
                Dernière synchro: {new Date(wearablesStatus.lastSyncGoogleFit).toLocaleString('fr-FR')}
              </p>
            )}
          </div>

          <div className="wearable-card">
            <div className="wearable-header">
              <span className="wearable-icon">🟠</span>
              <span className="wearable-name">Strava</span>
              <span className={`status-badge ${wearablesStatus.strava ? 'connected' : 'disconnected'}`}>
                {wearablesStatus.strava ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>
            <p className="wearable-description">Importez vos activités (running, vélo, natation...)</p>
            {!wearablesStatus.strava ? (
              <button className="btn-connect" onClick={handleStravaConnect}>
                Connecter Strava
              </button>
            ) : (
              <button
                className="btn-sync"
                onClick={handleSyncStrava}
                disabled={syncing.strava}
              >
                {syncing.strava ? 'Synchronisation...' : 'Synchroniser maintenant'}
              </button>
            )}
            {wearablesStatus.lastSyncStrava && (
              <p className="last-sync">
                Dernière synchro: {new Date(wearablesStatus.lastSyncStrava).toLocaleString('fr-FR')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Health Data Charts */}
      {healthData.length > 0 && (
        <div className="charts-section">
          <div className="chart-container">
            <h3>👣 Pas quotidiens (7 jours)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={healthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="steps" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3>❤️ Fréquence cardiaque (7 jours)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={healthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="heart_rate" stroke="#ff7300" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3>🔥 Calories brûlées (7 jours)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={healthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="calories" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Activities Section */}
      {activities.length > 0 && (
        <div className="activities-section">
          <h2>🏃 Activités récentes (Strava)</h2>
          <div className="activities-list">
            {activities.slice(0, 10).map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {formatActivityType(activity.sport_type)}
                </div>
                <div className="activity-details">
                  <h4>{activity.name}</h4>
                  <p>{new Date(activity.start_date).toLocaleDateString('fr-FR')}</p>
                  <div className="activity-stats">
                    <span>⏱️ {formatDuration(activity.elapsed_time)}</span>
                    <span>📍 {formatDistance(activity.distance)}</span>
                    {activity.elevation_gain > 0 && (
                      <span>⛰️ {activity.elevation_gain.toFixed(0)}m</span>
                    )}
                    {activity.average_heart_rate && (
                      <span>❤️ {Math.round(activity.average_heart_rate)} bpm</span>
                    )}
                    {activity.calories && (
                      <span>🔥 {Math.round(activity.calories)} kcal</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!wearablesStatus.googleFit && !wearablesStatus.strava && (
        <div className="empty-state">
          <p>Connectez votre montre pour commencer!</p>
          <p>Les données de santé seront affichées ici une fois synchronisées.</p>
        </div>
      )}
    </div>
  );
}

export default HealthDashboard;
