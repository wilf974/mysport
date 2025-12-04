import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Nutrition.css';
import FastingTimer from './FastingTimer';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Nutrition({ userId }) {
    const [date, setDate] = useState(new Date());
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showGoalsModal, setShowGoalsModal] = useState(false);
    const [showFasting, setShowFasting] = useState(false);
    const [selectedType, setSelectedType] = useState('breakfast');
    const [goals, setGoals] = useState({
        calories: 2500,
        protein: 180,
        carbs: 300,
        fats: 80
    });

    // Form state
    const [newMeal, setNewMeal] = useState({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: ''
    });

    const [userStats, setUserStats] = useState({
        weight: '',
        height: '',
        age: '',
        gender: 'male',
        activity_level: 'moderate',
        goal: 'maintain'
    });

    useEffect(() => {
        fetchMeals();
        fetchGoals();
    }, [date]);

    const fetchMeals = async () => {
        try {
            setLoading(true);
            const formattedDate = date.toISOString().split('T')[0];
            const response = await axios.get(`${API_URL}/nutrition/${userId}?date=${formattedDate}`);
            setMeals(response.data);
        } catch (err) {
            console.error('Erreur chargement repas:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchGoals = async () => {
        try {
            const response = await axios.get(`${API_URL}/nutrition/goals/${userId}`);
            if (response.data && response.data.calories) {
                setGoals(response.data);
                setUserStats({
                    weight: response.data.weight || '',
                    height: response.data.height || '',
                    age: response.data.age || '',
                    gender: response.data.gender || 'male',
                    activity_level: response.data.activity_level || 'moderate',
                    goal: response.data.goal || 'maintain'
                });
            }
        } catch (err) {
            console.error('Erreur chargement objectifs:', err);
        }
    };

    const handleDateChange = (days) => {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() + days);
        setDate(newDate);
    };

    const handleAddMeal = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/nutrition`, {
                user_id: userId,
                ...newMeal,
                calories: parseInt(newMeal.calories) || 0,
                protein: parseFloat(newMeal.protein) || 0,
                carbs: parseFloat(newMeal.carbs) || 0,
                fats: parseFloat(newMeal.fats) || 0,
                date: date.toISOString(),
                type: selectedType
            });

            setMeals([...meals, response.data]);
            setShowAddModal(false);
            setNewMeal({ name: '', calories: '', protein: '', carbs: '', fats: '' });
        } catch (err) {
            console.error('Erreur ajout repas:', err);
        }
    };

    const handleUpdateGoals = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/nutrition/goals`, {
                user_id: userId,
                ...userStats,
                weight: parseFloat(userStats.weight),
                height: parseFloat(userStats.height),
                age: parseInt(userStats.age)
            });

            if (response.data.success) {
                setGoals(response.data.goals);
                setShowGoalsModal(false);
            }
        } catch (err) {
            console.error('Erreur mise à jour objectifs:', err);
        }
    };

    const handleDeleteMeal = async (id) => {
        if (!window.confirm('Supprimer ce repas ?')) return;
        try {
            await axios.delete(`${API_URL}/nutrition/${id}`);
            setMeals(meals.filter(m => m.id !== id));
        } catch (err) {
            console.error('Erreur suppression repas:', err);
        }
    };

    const getTotals = () => {
        return meals.reduce((acc, meal) => ({
            calories: acc.calories + (meal.calories || 0),
            protein: acc.protein + (meal.protein || 0),
            carbs: acc.carbs + (meal.carbs || 0),
            fats: acc.fats + (meal.fats || 0)
        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
    };

    const totals = getTotals();
    const mealTypes = [
        { id: 'breakfast', label: 'Petit-déjeuner', icon: '☕' },
        { id: 'lunch', label: 'Déjeuner', icon: '🥗' },
        { id: 'dinner', label: 'Dîner', icon: '🍽️' },
        { id: 'snack', label: 'Collations', icon: '🍎' }
    ];

    return (
        <div className="nutrition-container">
            <div className="nutrition-header">
                <h2>🍏 Journal Alimentaire</h2>
                {!showFasting && (
                    <div className="date-selector">
                        <button className="date-nav-btn" onClick={() => handleDateChange(-1)}>◀</button>
                        <span className="current-date">
                            {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                        <button className="date-nav-btn" onClick={() => handleDateChange(1)}>▶</button>
                    </div>
                )}
                <div className="header-actions">
                    <button
                        className={`btn-goals ${showFasting ? 'active' : ''}`}
                        onClick={() => setShowFasting(!showFasting)}
                    >
                        {showFasting ? '🍽️ Journal' : '⏱️ Jeûne'}
                    </button>
                    {!showFasting && (
                        <button className="btn-goals" onClick={() => setShowGoalsModal(true)}>
                            🎯 Objectifs
                        </button>
                    )}
                </div>
            </div>

            {showFasting ? (
                <FastingTimer userId={userId} />
            ) : (
                <>
                    <div className="macros-summary">
                        <div className="macro-card calories">
                            <span className="macro-value">{totals.calories}</span>
                            <span className="macro-label">Calories</span>
                            <span className="macro-target">Objectif: {goals.calories}</span>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${Math.min((totals.calories / goals.calories) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="macro-card protein">
                            <span className="macro-value">{totals.protein.toFixed(0)}g</span>
                            <span className="macro-label">Protéines</span>
                            <span className="macro-target">Objectif: {goals.protein}g</span>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${Math.min((totals.protein / goals.protein) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="macro-card carbs">
                            <span className="macro-value">{totals.carbs.toFixed(0)}g</span>
                            <span className="macro-label">Glucides</span>
                            <span className="macro-target">Objectif: {goals.carbs}g</span>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${Math.min((totals.carbs / goals.carbs) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="macro-card fats">
                            <span className="macro-value">{totals.fats.toFixed(0)}g</span>
                            <span className="macro-label">Lipides</span>
                            <span className="macro-target">Objectif: {goals.fats}g</span>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${Math.min((totals.fats / goals.fats) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="meals-section">
                        {mealTypes.map(type => {
                            const typeMeals = meals.filter(m => m.type === type.id);
                            const typeCalories = typeMeals.reduce((sum, m) => sum + (m.calories || 0), 0);

                            return (
                                <div key={type.id} className="meal-group">
                                    <div className="meal-group-header">
                                        <h3>{type.icon} {type.label}</h3>
                                        <span className="meal-group-total">{typeCalories} kcal</span>
                                    </div>

                                    <ul className="meal-list">
                                        {typeMeals.map(meal => (
                                            <li key={meal.id} className="meal-item">
                                                <div className="meal-info">
                                                    <h4>{meal.name}</h4>
                                                    <div className="meal-macros">
                                                        <span>🔥 {meal.calories}</span>
                                                        <span>🥩 {meal.protein}p</span>
                                                        <span>🍚 {meal.carbs}g</span>
                                                        <span>🥑 {meal.fats}l</span>
                                                    </div>
                                                </div>
                                                <div className="meal-actions">
                                                    <button
                                                        className="btn-icon"
                                                        onClick={() => handleDeleteMeal(meal.id)}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        className="add-meal-btn"
                                        onClick={() => {
                                            setSelectedType(type.id);
                                            setShowAddModal(true);
                                        }}
                                    >
                                        + Ajouter un aliment
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {showAddModal && (
                <div className="modal" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Ajouter au {mealTypes.find(t => t.id === selectedType)?.label}</h3>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleAddMeal} className="add-meal-form">
                            <div className="form-group">
                                <label>Nom de l'aliment / repas</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newMeal.name}
                                    onChange={e => setNewMeal({ ...newMeal, name: e.target.value })}
                                    placeholder="Ex: Poulet riz brocolis"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Calories</label>
                                    <div className="macro-input-group">
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={newMeal.calories}
                                            onChange={e => setNewMeal({ ...newMeal, calories: e.target.value })}
                                            placeholder="0"
                                        />
                                        <span className="macro-suffix">kcal</span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Protéines</label>
                                    <div className="macro-input-group">
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={newMeal.protein}
                                            onChange={e => setNewMeal({ ...newMeal, protein: e.target.value })}
                                            placeholder="0"
                                        />
                                        <span className="macro-suffix">g</span>
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Glucides</label>
                                    <div className="macro-input-group">
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={newMeal.carbs}
                                            onChange={e => setNewMeal({ ...newMeal, carbs: e.target.value })}
                                            placeholder="0"
                                        />
                                        <span className="macro-suffix">g</span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Lipides</label>
                                    <div className="macro-input-group">
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={newMeal.fats}
                                            onChange={e => setNewMeal({ ...newMeal, fats: e.target.value })}
                                            placeholder="0"
                                        />
                                        <span className="macro-suffix">g</span>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Ajouter
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showGoalsModal && (
                <div className="modal" onClick={() => setShowGoalsModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>🎯 Calculer mes objectifs (TDEE)</h3>
                            <button className="modal-close" onClick={() => setShowGoalsModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleUpdateGoals} className="goals-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Poids (kg)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={userStats.weight}
                                        onChange={e => setUserStats({ ...userStats, weight: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Taille (cm)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={userStats.height}
                                        onChange={e => setUserStats({ ...userStats, height: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Âge</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={userStats.age}
                                        onChange={e => setUserStats({ ...userStats, age: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Genre</label>
                                    <select
                                        className="form-control"
                                        value={userStats.gender}
                                        onChange={e => setUserStats({ ...userStats, gender: e.target.value })}
                                    >
                                        <option value="male">Homme</option>
                                        <option value="female">Femme</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Niveau d'activité</label>
                                <select
                                    className="form-control"
                                    value={userStats.activity_level}
                                    onChange={e => setUserStats({ ...userStats, activity_level: e.target.value })}
                                >
                                    <option value="sedentary">Sédentaire (peu ou pas d'exercice)</option>
                                    <option value="light">Léger (1-3 fois/semaine)</option>
                                    <option value="moderate">Modéré (3-5 fois/semaine)</option>
                                    <option value="active">Actif (6-7 fois/semaine)</option>
                                    <option value="very_active">Très actif (physique + sport)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Objectif</label>
                                <select
                                    className="form-control"
                                    value={userStats.goal}
                                    onChange={e => setUserStats({ ...userStats, goal: e.target.value })}
                                >
                                    <option value="cut">Perte de poids (Déficit)</option>
                                    <option value="maintain">Maintien</option>
                                    <option value="bulk">Prise de masse (Surplus)</option>
                                </select>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowGoalsModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Calculer & Sauvegarder
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Nutrition;
