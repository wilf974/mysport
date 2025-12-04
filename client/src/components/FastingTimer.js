import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './FastingTimer.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function FastingTimer({ userId }) {
    const [activeFast, setActiveFast] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    const [targetHours, setTargetHours] = useState(16);
    const [history, setHistory] = useState([]);
    const timerRef = useRef(null);

    useEffect(() => {
        fetchCurrentFast();
        fetchHistory();
        return () => clearInterval(timerRef.current);
    }, [userId]);

    useEffect(() => {
        if (activeFast) {
            const interval = setInterval(() => {
                const startTime = new Date(activeFast.start_time).getTime();
                const now = new Date().getTime();
                setElapsed(Math.floor((now - startTime) / 1000));
            }, 1000);
            timerRef.current = interval;
            return () => clearInterval(interval);
        } else {
            setElapsed(0);
        }
    }, [activeFast]);

    const fetchCurrentFast = async () => {
        try {
            const response = await axios.get(`${API_URL}/fasting/current/${userId}`);
            if (response.data) {
                setActiveFast(response.data);
                setTargetHours(response.data.target_hours);
            } else {
                setActiveFast(null);
            }
        } catch (err) {
            console.error('Erreur chargement jeûne:', err);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await axios.get(`${API_URL}/fasting/history/${userId}`);
            setHistory(response.data);
        } catch (err) {
            console.error('Erreur historique jeûne:', err);
        }
    };

    const startFast = async () => {
        try {
            const startTime = new Date().toISOString();
            const response = await axios.post(`${API_URL}/fasting/start`, {
                user_id: userId,
                start_time: startTime,
                target_hours: targetHours
            });
            setActiveFast(response.data);
            fetchHistory(); // Refresh history to show closed previous fasts if any
        } catch (err) {
            console.error('Erreur démarrage jeûne:', err);
        }
    };

    const endFast = async () => {
        if (!activeFast) return;
        try {
            await axios.put(`${API_URL}/fasting/end`, {
                user_id: userId,
                end_time: new Date().toISOString()
            });
            setActiveFast(null);
            fetchHistory();
        } catch (err) {
            console.error('Erreur fin jeûne:', err);
        }
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const getProgress = () => {
        if (!activeFast) return 0;
        const targetSeconds = targetHours * 3600;
        return Math.min((elapsed / targetSeconds) * 100, 100);
    };

    const getStatusMessage = () => {
        if (!activeFast) return "Prêt à commencer ?";
        const targetSeconds = targetHours * 3600;
        if (elapsed >= targetSeconds) return "🎉 Objectif atteint !";
        return "🔥 Brûlage de graisses en cours...";
    };

    return (
        <div className="fasting-container">
            <div className="fasting-header">
                <h2>⏳ Jeûne Intermittent</h2>
            </div>

            <div className="timer-card">
                <div className="timer-display">
                    <div className="progress-ring-container">
                        <svg className="progress-ring" width="200" height="200">
                            <circle
                                className="progress-ring-circle-bg"
                                stroke="var(--bg-surface-alt)"
                                strokeWidth="10"
                                fill="transparent"
                                r="90"
                                cx="100"
                                cy="100"
                            />
                            <circle
                                className="progress-ring-circle"
                                stroke="var(--primary)"
                                strokeWidth="10"
                                fill="transparent"
                                r="90"
                                cx="100"
                                cy="100"
                                style={{
                                    strokeDasharray: `${2 * Math.PI * 90}`,
                                    strokeDashoffset: `${2 * Math.PI * 90 * (1 - getProgress() / 100)}`,
                                    transition: 'stroke-dashoffset 0.5s ease-in-out'
                                }}
                            />
                        </svg>
                        <div className="timer-text">
                            <span className="elapsed-time">{formatTime(elapsed)}</span>
                            <span className="timer-label">{activeFast ? 'Écoulé' : 'Inactif'}</span>
                        </div>
                    </div>
                </div>

                <div className="timer-status">
                    <p>{getStatusMessage()}</p>
                </div>

                <div className="timer-controls">
                    {!activeFast ? (
                        <>
                            <div className="protocol-selector">
                                <label>Protocole :</label>
                                <select value={targetHours} onChange={(e) => setTargetHours(Number(e.target.value))}>
                                    <option value={16}>16:8 (Le classique)</option>
                                    <option value={18}>18:6 (Avancé)</option>
                                    <option value={20}>20:4 (Warrior)</option>
                                    <option value={24}>24h (OMAD)</option>
                                </select>
                            </div>
                            <button className="btn-start-fast" onClick={startFast}>
                                ▶ Commencer le jeûne
                            </button>
                        </>
                    ) : (
                        <button className="btn-end-fast" onClick={endFast}>
                            ⏹ Terminer le jeûne
                        </button>
                    )}
                </div>
            </div>

            <div className="fasting-history">
                <h3>Historique récent</h3>
                <div className="history-list">
                    {history.length === 0 ? (
                        <p className="no-history">Aucun jeûne enregistré.</p>
                    ) : (
                        history.map(fast => {
                            const duration = (new Date(fast.end_time) - new Date(fast.start_time)) / 1000;
                            const hours = (duration / 3600).toFixed(1);
                            const isTargetMet = duration >= fast.target_hours * 3600;

                            return (
                                <div key={fast.id} className={`history-item ${isTargetMet ? 'success' : ''}`}>
                                    <div className="history-date">
                                        {new Date(fast.start_time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                    </div>
                                    <div className="history-details">
                                        <span className="history-duration">{hours}h</span>
                                        <span className="history-target">Objectif: {fast.target_hours}h</span>
                                    </div>
                                    <div className="history-status">
                                        {isTargetMet ? '✅' : '⚠️'}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default FastingTimer;
