import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BodyMeasurements.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function BodyMeasurements({ userId }) {
  const [measurements, setMeasurements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    neck: '',
    shoulders: '',
    chest: '',
    waist: '',
    hips: '',
    biceps: '',
    forearms: '',
    thighs: '',
    calves: '',
    weight: '',
    body_fat_percentage: '',
    notes: ''
  });

  const measurementFields = [
    { key: 'weight', label: 'Poids', unit: 'kg' },
    { key: 'neck', label: 'Cou', unit: 'cm' },
    { key: 'shoulders', label: 'Épaules', unit: 'cm' },
    { key: 'chest', label: 'Poitrine', unit: 'cm' },
    { key: 'waist', label: 'Taille', unit: 'cm' },
    { key: 'hips', label: 'Hanches', unit: 'cm' },
    { key: 'biceps', label: 'Biceps', unit: 'cm' },
    { key: 'forearms', label: 'Avant-bras', unit: 'cm' },
    { key: 'thighs', label: 'Cuisses', unit: 'cm' },
    { key: 'calves', label: 'Mollets', unit: 'cm' },
    { key: 'body_fat_percentage', label: 'Graisse corporelle', unit: '%' }
  ];

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const fetchMeasurements = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/measurements/${userId}`);
      setMeasurements(response.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
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

    try {
      const response = await axios.post(`${API_URL}/measurements`, {
        user_id: userId,
        ...formData
      });

      const newMeasurement = {
        id: response.data.id,
        date: new Date().toISOString(),
        ...formData
      };

      setMeasurements([newMeasurement, ...measurements]);
      setShowForm(false);
      setFormData({
        neck: '',
        shoulders: '',
        chest: '',
        waist: '',
        hips: '',
        biceps: '',
        forearms: '',
        thighs: '',
        calves: '',
        weight: '',
        body_fat_percentage: '',
        notes: ''
      });
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de l\'enregistrement des mesures');
    }
  };

  const getLatestValue = (field) => {
    if (measurements.length > 0) {
      return measurements[0][field];
    }
    return null;
  };

  const getDifference = (field, index = 1) => {
    if (measurements.length > index) {
      const current = parseFloat(measurements[0][field]) || 0;
      const previous = parseFloat(measurements[index][field]) || 0;
      const diff = current - previous;
      if (diff === 0) return null;
      return {
        value: Math.abs(diff).toFixed(1),
        isPositive: diff > 0
      };
    }
    return null;
  };

  return (
    <div className="body-measurements">
      <div className="measurements-header">
        <h2>📏 Mesures Corporelles</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Annuler' : '+ Ajouter des mesures'}
        </button>
      </div>

      {showForm && (
        <div className="measurement-form card">
          <h3>Nouvelles mesures</h3>
          <form onSubmit={handleSubmit}>
            <div className="measurements-grid">
              {measurementFields.map(field => (
                <div key={field.key} className="form-group">
                  <label>{field.label} ({field.unit})</label>
                  <input
                    type="number"
                    name={field.key}
                    value={formData[field.key]}
                    onChange={handleInputChange}
                    placeholder="0"
                    step="0.1"
                  />
                </div>
              ))}
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Observations personnelles..."
                rows="3"
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn btn-success">
                Enregistrer les mesures
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    neck: '',
                    shoulders: '',
                    chest: '',
                    waist: '',
                    hips: '',
                    biceps: '',
                    forearms: '',
                    thighs: '',
                    calves: '',
                    weight: '',
                    body_fat_percentage: '',
                    notes: ''
                  });
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
      ) : measurements.length === 0 ? (
        <div className="empty-state">
          <p>Aucune mesure enregistrée</p>
          <small>Commencez à suivre vos mesures pour voir votre progression</small>
        </div>
      ) : (
        <div className="measurements-content">
          <div className="current-measurements card">
            <h3>Mesures actuelles</h3>
            <div className="measurements-display">
              {measurementFields.map(field => {
                const current = getLatestValue(field.key);
                const diff = getDifference(field.key);

                if (!current) return null;

                return (
                  <div key={field.key} className="measurement-item">
                    <div className="measurement-label">{field.label}</div>
                    <div className="measurement-value">
                      {current}
                      <span className="unit">{field.unit}</span>
                    </div>
                    {diff && (
                      <div className={`measurement-diff ${diff.isPositive ? 'positive' : 'negative'}`}>
                        {diff.isPositive ? '+' : '-'}{diff.value}{field.unit}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="measurements-history card">
            <h3>Historique des mesures</h3>
            <div className="history-table">
              <div className="history-header">
                <div className="history-date">Date</div>
                <div className="history-values">Mesures principales</div>
                <div className="history-notes">Notes</div>
              </div>

              {measurements.map((measurement, index) => (
                <div key={measurement.id || index} className="history-row">
                  <div className="history-date">
                    {new Date(measurement.date).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="history-values">
                    <div className="value-item">
                      <span className="value-label">Poids:</span>
                      <span className="value-number">{measurement.weight || '-'} kg</span>
                    </div>
                    <div className="value-item">
                      <span className="value-label">Taille:</span>
                      <span className="value-number">{measurement.waist || '-'} cm</span>
                    </div>
                    <div className="value-item">
                      <span className="value-label">Poitrine:</span>
                      <span className="value-number">{measurement.chest || '-'} cm</span>
                    </div>
                  </div>
                  <div className="history-notes">
                    {measurement.notes || '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BodyMeasurements;
