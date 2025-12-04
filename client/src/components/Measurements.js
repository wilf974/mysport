import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './Measurements.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Measurements({ userId }) {
    const [measurements, setMeasurements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState('weight');

    const [newMeasurement, setNewMeasurement] = useState({
        weight: '',
        body_fat_percentage: '',
        neck: '',
        shoulders: '',
        chest: '',
        waist: '',
        hips: '',
        biceps: '',
        forearms: '',
        thighs: '',
        calves: '',
        notes: ''
    });

    const metrics = [
        { id: 'weight', label: 'Poids (kg)', color: '#3b82f6' },
        { id: 'body_fat_percentage', label: 'Masse Grasse (%)', color: '#f59e0b' },
        { id: 'waist', label: 'Taille (cm)', color: '#10b981' },
        { id: 'chest', label: 'Poitrine (cm)', color: '#8b5cf6' },
        { id: 'shoulders', label: 'Épaules (cm)', color: '#6366f1' },
        { id: 'biceps', label: 'Bras (cm)', color: '#ec4899' },
        { id: 'thighs', label: 'Cuisses (cm)', color: '#ef4444' },
        { id: 'calves', label: 'Mollets (cm)', color: '#14b8a6' },
        { id: 'hips', label: 'Hanches (cm)', color: '#f97316' },
        { id: 'neck', label: 'Cou (cm)', color: '#64748b' },
        { id: 'forearms', label: 'Avant-bras (cm)', color: '#84cc16' }
    ];

    useEffect(() => {
        fetchMeasurements();
    }, []);

    const fetchMeasurements = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/measurements/${userId}`);
            setMeasurements(response.data.reverse()); // Oldest first for chart
        } catch (err) {
            console.error('Erreur chargement mesures:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMeasurement = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/measurements`, {
                user_id: userId,
                ...newMeasurement
            });

            // Refresh data
            fetchMeasurements();
            setShowAddModal(false);

            // Reset form
            setNewMeasurement({
                weight: '',
                body_fat_percentage: '',
                neck: '',
                shoulders: '',
                chest: '',
                waist: '',
                hips: '',
                biceps: '',
                forearms: '',
                thighs: '',
                calves: '',
                notes: ''
            });
        } catch (err) {
            console.error('Erreur ajout mesure:', err);
        }
    };

    const handleDeleteMeasurement = async (id) => {
        if (!window.confirm('Supprimer cette mesure ?')) return;
        try {
            await axios.delete(`${API_URL}/measurements/${id}`);
            setMeasurements(measurements.filter(m => m.id !== id));
        } catch (err) {
            console.error('Erreur suppression mesure:', err);
        }
    };

    // Prepare Chart Data
    const getChartData = () => {
        const metric = metrics.find(m => m.id === selectedMetric);

        // Filter out entries where the selected metric is null/0
        const validData = measurements.filter(m => m[selectedMetric] && m[selectedMetric] > 0);

        return {
            labels: validData.map(m => new Date(m.date).toLocaleDateString('fr-FR')),
            datasets: [
                {
                    label: metric.label,
                    data: validData.map(m => m[selectedMetric]),
                    borderColor: metric.color,
                    backgroundColor: `${metric.color}33`, // 20% opacity
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#94a3b8'
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#94a3b8',
                    maxTicksLimit: 8
                }
            }
        }
    };

    // Get latest values for summary
    const latest = measurements.length > 0 ? measurements[measurements.length - 1] : {};

    return (
        <div className="measurements-container">
            <div className="measurements-header">
                <h2>📏 Mensurations & Suivi</h2>
                <button className="btn-add-measure" onClick={() => setShowAddModal(true)}>
                    + Nouvelle mesure
                </button>
            </div>

            <div className="measurements-summary">
                <div className="summary-card highlight">
                    <span className="summary-label">Poids Actuel</span>
                    <span className="summary-value">{latest.weight || '--'} <small>kg</small></span>
                </div>
                <div className="summary-card">
                    <span className="summary-label">Taille</span>
                    <span className="summary-value">{latest.waist || '--'} <small>cm</small></span>
                </div>
                <div className="summary-card">
                    <span className="summary-label">Bras</span>
                    <span className="summary-value">{latest.biceps || '--'} <small>cm</small></span>
                </div>
                <div className="summary-card">
                    <span className="summary-label">Cuisses</span>
                    <span className="summary-value">{latest.thighs || '--'} <small>cm</small></span>
                </div>
            </div>

            <div className="chart-section">
                <div className="chart-controls">
                    <h3>Évolution : {metrics.find(m => m.id === selectedMetric)?.label}</h3>
                    <select
                        value={selectedMetric}
                        onChange={(e) => setSelectedMetric(e.target.value)}
                        className="metric-selector"
                    >
                        {metrics.map(m => (
                            <option key={m.id} value={m.id}>{m.label}</option>
                        ))}
                    </select>
                </div>

                <div className="chart-wrapper">
                    {measurements.length > 0 ? (
                        <Line data={getChartData()} options={chartOptions} />
                    ) : (
                        <div className="no-data-chart">
                            <p>Aucune donnée disponible pour le graphique</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="history-section">
                <h3>Historique</h3>
                <div className="history-table-wrapper">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Poids</th>
                                <th>Taille</th>
                                <th>Bras</th>
                                <th>Cuisses</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...measurements].reverse().map(m => (
                                <tr key={m.id}>
                                    <td>{new Date(m.date).toLocaleDateString('fr-FR')}</td>
                                    <td>{m.weight ? `${m.weight} kg` : '-'}</td>
                                    <td>{m.waist ? `${m.waist} cm` : '-'}</td>
                                    <td>{m.biceps ? `${m.biceps} cm` : '-'}</td>
                                    <td>{m.thighs ? `${m.thighs} cm` : '-'}</td>
                                    <td>
                                        <button
                                            className="btn-delete-mini"
                                            onClick={() => handleDeleteMeasurement(m.id)}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {measurements.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center">Aucune mesure enregistrée</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAddModal && (
                <div className="modal" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Ajouter des mesures</h3>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleAddMeasurement} className="measure-form">
                            <div className="form-section-title">Général</div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Poids (kg)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="form-control"
                                        value={newMeasurement.weight}
                                        onChange={e => setNewMeasurement({ ...newMeasurement, weight: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Masse Grasse (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="form-control"
                                        value={newMeasurement.body_fat_percentage}
                                        onChange={e => setNewMeasurement({ ...newMeasurement, body_fat_percentage: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-section-title">Haut du corps</div>
                            <div className="form-row three-cols">
                                <div className="form-group">
                                    <label>Cou</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        className="form-control"
                                        value={newMeasurement.neck}
                                        onChange={e => setNewMeasurement({ ...newMeasurement, neck: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Épaules</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        className="form-control"
                                        value={newMeasurement.shoulders}
                                        onChange={e => setNewMeasurement({ ...newMeasurement, shoulders: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Poitrine</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        className="form-control"
                                        value={newMeasurement.chest}
                                        onChange={e => setNewMeasurement({ ...newMeasurement, chest: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-row three-cols">
                                <div className="form-group">
                                    <label>Bras (Biceps)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        className="form-control"
                                        value={newMeasurement.biceps}
                                        onChange={e => setNewMeasurement({ ...newMeasurement, biceps: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Avant-bras</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        className="form-control"
                                        value={newMeasurement.forearms}
                                        onChange={e => setNewMeasurement({ ...newMeasurement, forearms: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-section-title">Tronc & Bas du corps</div>
                            <div className="form-row three-cols">
                                <div className="form-group">
                                    <label>Taille</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        className="form-control"
                                        value={newMeasurement.waist}
                                        onChange={e => setNewMeasurement({ ...newMeasurement, waist: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Hanches</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        className="form-control"
                                        value={newMeasurement.hips}
                                        onChange={e => setNewMeasurement({ ...newMeasurement, hips: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-row three-cols">
                                <div className="form-group">
                                    <label>Cuisses</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        className="form-control"
                                        value={newMeasurement.thighs}
                                        onChange={e => setNewMeasurement({ ...newMeasurement, thighs: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Mollets</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        className="form-control"
                                        value={newMeasurement.calves}
                                        onChange={e => setNewMeasurement({ ...newMeasurement, calves: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    value={newMeasurement.notes}
                                    onChange={e => setNewMeasurement({ ...newMeasurement, notes: e.target.value })}
                                    placeholder="Conditions de pesée, etc."
                                ></textarea>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Measurements;
