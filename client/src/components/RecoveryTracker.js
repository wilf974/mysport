import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RecoveryTracker.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function RecoveryTracker({ userId }) {
    const [scores, setScores] = useState([]);
    const [todayScore, setTodayScore] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        sleep_score: 5,
        energy_score: 5,
        mood_score: 5,
        soreness_score: 5,
        notes: ''
    });

    useEffect(() => {
        fetchScores();
    }, []);

    const fetchScores = async () => {
        try {
            const response = await axios.get(`${API_URL}/recovery/${userId}`);
            setScores(response.data);

            // Check if entry exists for today
            const today = new Date().toISOString().split('T')[0];
            const found = response.data.find(s => s.date.startsWith(today));
            if (found) setTodayScore(found);
        } catch (err) {
            console.error('Erreur chargement récupération:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/recovery`, {
                user_id: userId,
                ...formData,
                date: new Date().toISOString()
            });

            setScores([response.data, ...scores]);
            setTodayScore(response.data);
            setShowModal(false);
        } catch (err) {
            console.error('Erreur enregistrement score:', err);
        }
    };

    const getGlobalScore = (score) => {
        if (!score) return 0;
        // Average of 4 metrics * 10 to get percentage
        return Math.round((score.sleep_score + score.energy_score + score.mood_score + score.soreness_score) / 4 * 10);
    };

    const getRecommendation = (globalScore) => {
        if (globalScore >= 80) return { text: "🚀 Go Hard ! Tu es au top.", color: "var(--success)" };
        if (globalScore >= 50) return { text: "✅ Entraînement normal.", color: "var(--warning)" };
        return { text: "💤 Repos ou séance légère conseillée.", color: "var(--danger)" };
    };

    const renderStars = (value, onChange, name) => {
        return (
            <div className="star-rating">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <span
                        key={num}
                        className={`star ${num <= value ? 'filled' : ''}`}
                        onClick={() => onChange && onChange({ ...formData, [name]: num })}
                    >
                        ★
                    </span>
                ))}
                <span className="rating-value">{value}/10</span>
            </div>
        );
    };

    const globalScore = todayScore ? getGlobalScore(todayScore) : 0;
    const recommendation = getRecommendation(globalScore);

    return (
        <div className="recovery-container">
            <div className="recovery-header">
                <h2>🔋 Forme & Récupération</h2>
                {!todayScore && (
                    <button className="btn-checkin" onClick={() => setShowModal(true)}>
                        📝 Check-in du jour
                    </button>
                )}
            </div>

            {todayScore ? (
                <div className="daily-score-card">
                    <div className="score-circle" style={{ borderColor: recommendation.color }}>
                        <span className="score-number" style={{ color: recommendation.color }}>{globalScore}%</span>
                        <span className="score-label">Score du jour</span>
                    </div>
                    <div className="score-details">
                        <h3>{recommendation.text}</h3>
                        <div className="metrics-grid-mini">
                            <div className="metric-mini">😴 Sommeil: <strong>{todayScore.sleep_score}/10</strong></div>
                            <div className="metric-mini">⚡ Énergie: <strong>{todayScore.energy_score}/10</strong></div>
                            <div className="metric-mini">🙂 Humeur: <strong>{todayScore.mood_score}/10</strong></div>
                            <div className="metric-mini">🤕 Courbatures: <strong>{todayScore.soreness_score}/10</strong></div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="no-score-card" onClick={() => setShowModal(true)}>
                    <span className="icon">💤</span>
                    <p>Comment te sens-tu aujourd'hui ?<br />Clique pour faire ton bilan.</p>
                </div>
            )}

            <div className="history-section">
                <h3>Historique récent</h3>
                <div className="history-list">
                    {scores.map(score => (
                        <div key={score.id} className="history-item">
                            <span className="date">
                                {new Date(score.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            </span>
                            <div className="mini-bar-container">
                                <div
                                    className="mini-bar"
                                    style={{
                                        width: `${getGlobalScore(score)}%`,
                                        backgroundColor: getRecommendation(getGlobalScore(score)).color
                                    }}
                                ></div>
                            </div>
                            <span className="score-val">{getGlobalScore(score)}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {showModal && (
                <div className="modal" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Check-in Forme</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="recovery-form">
                            <div className="form-group">
                                <label>😴 Qualité du sommeil</label>
                                {renderStars(formData.sleep_score, setFormData, 'sleep_score')}
                            </div>

                            <div className="form-group">
                                <label>⚡ Niveau d'énergie</label>
                                {renderStars(formData.energy_score, setFormData, 'energy_score')}
                            </div>

                            <div className="form-group">
                                <label>🙂 Humeur / Stress</label>
                                {renderStars(formData.mood_score, setFormData, 'mood_score')}
                            </div>

                            <div className="form-group">
                                <label>🤕 Courbatures (10 = Aucune, 1 = Max)</label>
                                {renderStars(formData.soreness_score, setFormData, 'soreness_score')}
                            </div>

                            <div className="form-group">
                                <label>Notes (Optionnel)</label>
                                <textarea
                                    className="form-control"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Mal dormi ? Stress au boulot ?"
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Valider
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RecoveryTracker;
