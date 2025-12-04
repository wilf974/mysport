import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FoodSearch.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function FoodSearch({ onFoodSelected, onCancel }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const debounceTimer = setTimeout(() => {
      fetchFoodSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const fetchFoodSuggestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/food-search`, {
        params: {
          query: query,
          limit: 10
        }
      });
      setSuggestions(response.data || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Erreur recherche aliment:', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFoodSelect = (food) => {
    onFoodSelected({
      name: food.name,
      calories: food.calories || 0,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fats: food.fats || 0,
      food_id: food.id,
      serving_size: food.serving_size
    });
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="food-search-container">
      <div className="food-search-input-wrapper">
        <input
          type="text"
          className="food-search-input"
          placeholder="Rechercher un aliment... (ex: Poulet, Riz, Œuf)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          autoFocus
        />
        {loading && <span className="search-spinner">⏳</span>}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="food-suggestions">
          {suggestions.map((food) => (
            <div
              key={food.id}
              className="food-suggestion-item"
              onClick={() => handleFoodSelect(food)}
            >
              <div className="suggestion-name">{food.name}</div>
              <div className="suggestion-macros">
                <span className="macro-badge calories">{food.calories} kcal</span>
                <span className="macro-badge protein">{food.protein}g P</span>
                <span className="macro-badge carbs">{food.carbs}g C</span>
                <span className="macro-badge fats">{food.fats}g L</span>
              </div>
              {food.serving_size && (
                <div className="suggestion-serving">{food.serving_size}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {showSuggestions && query.length >= 2 && suggestions.length === 0 && !loading && (
        <div className="food-no-results">
          Aucun aliment trouvé. Vous pouvez l'ajouter manuellement.
        </div>
      )}

      <div className="food-search-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

export default FoodSearch;
