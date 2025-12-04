import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MonthlyGoals.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function MonthlyGoals({ userId }) {
    const [goals, setGoals] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    const [newGoal, setNewGoal] = useState({
        title: '',
        target_value: '',
        unit: 'kg',
        category: 'strength'
    });

    useEffect(() => {
        fetchGoals();
    }, [currentDate]);

    const fetchGoals = async () => {
        try {
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            const response = await axios.get(`${API_URL}/goals/${userId}?month=${month}&year=${year}`);
            setGoals(response.data);
        } catch (err) {
            console.error('Erreur chargement objectifs:', err);
        }
    };

    const handleAddGoal = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/goals`, {
                user_id: userId,
                ...newGoal,
                target_value: parseFloat(newGoal.target_value),
                month: currentDate.getMonth() + 1,
                year: currentDate.getFullYear()
            });

            setGoals([response.data, ...goals]);
            setShowModal(false);
            setNewGoal({ title: '', target_value: '', unit: 'kg', category: 'strength' });
        } catch (err) {
            console.error('Erreur ajout objectif:', err);
        }
    };

    const handleUpdateProgress = async (id, currentVal, targetVal) => {
        try {
            const completed = parseFloat(currentVal) >= parseFloat(targetVal);
            await axios.put(`${API_URL}/goals/${id}`, {
                current_value: parseFloat(currentVal),
                completed
            });

            setGoals(goals.map(g => g.id === id ? { ...g, current_value: parseFloat(currentVal), completed } : g));
        } catch (err) {
            console.error('Erreur mise à jour progression:', err);
        }
    };

    const handleDeleteGoal = async (id) => {
        if (!window.confirm('Supprimer cet objectif ?')) return;
        try {
            await axios.delete(`${API_URL}/goals/${id}`);
            setGoals(goals.filter(g => g.id !== id));
        } catch (err) {
            console.error('Erreur suppression objectif:', err);
        }
    };

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const getProgressColor = (current, target) => {
        const percentage = (current / target) * 100;
        if (percentage >= 100) return 'var(--success)';
        if (percentage >= 50) return 'var(--warning)';
        return 'var(--danger)';
    };

    return (
        <div className="goals-container">
            <div className="goals-header">
                <h2>🎯 Objectifs Mensuels</h2>
                <div className="month-selector">
                    <button onClick={() => changeMonth(-1)}>◀</button>
                    <span>{currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => changeMonth(1)}>▶</button>
                </div>
                <button className="btn-add-goal" onClick={() => setShowModal(true)}>
                    + Nouvel Objectif
                </button>
            </div>

            <div className="goals-grid">
                {goals.map(goal => (
                    <div key={goal.id} className={`goal-card ${goal.completed ? 'completed' : ''}`}>
                        <div className="goal-header">
                            <span className={`goal-category ${goal.category}`}>{goal.category === 'strength' ? '💪 Force' : goal.category === 'physique' ? '📏 Physique' : '📅 Habitude'}</span>
                            <button className="btn-delete-mini" onClick={() => handleDeleteGoal(goal.id)}>✕</button>
                        </div>

                        <h3>{goal.title}</h3>

                        <div className="goal-progress-section">
                            <div className="progress-labels">
                                <span>{goal.current_value} {goal.unit}</span>
                                <span>{goal.target_value} {goal.unit}</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div
                                    className="progress-bar-fill"
                                    style={{
                                        width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%`,
                                        backgroundColor: getProgressColor(goal.current_value, goal.target_value)
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div className="goal-update-input">
                            <input
                                type="number"
                                placeholder="Mettre à jour..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleUpdateProgress(goal.id, e.target.value, goal.target_value);
                                        e.target.value = '';
                                    }
                                }}
                            />
                            <small>Entrée pour valider</small>
                        </div>
                    </div>
                ))}

                {goals.length === 0 && (
                    <div className="no-goals">
                        <p>Aucun objectif pour ce mois. Fixe-toi un défi ! 🚀</p>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Nouvel Objectif</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleAddGoal} className="goal-form">
                            <div className="form-group">
                                <label>Titre de l'objectif</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newGoal.title}
                                    onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                                    placeholder="Ex: Squat 100kg"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Cible</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={newGoal.target_value}
                                        onChange={e => setNewGoal({ ...newGoal, target_value: e.target.value })}
                                        placeholder="100"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Unité</label>
                                    <select
                                        className="form-control"
                                        value={newGoal.unit}
                                        onChange={e => setNewGoal({ ...newGoal, unit: e.target.value })}
                                    >
                                        <option value="kg">kg</option>
                                        <option value="cm">cm</option>
                                        <option value="rep">répétitions</option>
                                        <option value="séance">séances</option>
                                        <option value="%">%</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Catégorie</label>
                                <select
                                    className="form-control"
                                    value={newGoal.category}
                                    onChange={e => setNewGoal({ ...newGoal, category: e.target.value })}
                                >
                                    <option value="strength">Force / Perf</option>
                                    <option value="physique">Physique / Poids</option>
                                    <option value="habit">Habitude / Assiduité</option>
                                </select>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Créer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MonthlyGoals;
