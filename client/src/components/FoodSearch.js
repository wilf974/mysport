import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './FoodSearch.css';
import BarcodeScanner from './BarcodeScanner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function FoodSearch({ onFoodSelected, onCancel }) {
  const [query, setQuery] = useState('');
  const [barcode, setBarcode] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchMode, setSearchMode] = useState('text'); // 'text' or 'barcode'
  const [barcodeError, setBarcodeError] = useState('');
  const [scannerMode, setScannerMode] = useState(false); // false = manual input, true = camera scan

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
      serving_size: food.serving_size,
      source: food.source,
      barcode: food.barcode
    });
    setQuery('');
    setBarcode('');
    setSuggestions([]);
    setShowSuggestions(false);
    setBarcodeError('');
  };

  const handleBarcodeSearch = async () => {
    if (barcode.length < 8) {
      setBarcodeError('Code-barres invalide (minimum 8 chiffres)');
      return;
    }

    try {
      setLoading(true);
      setBarcodeError('');
      const response = await axios.get(`${API_URL}/food-search/barcode/${barcode}`);

      if (response.data) {
        handleFoodSelect(response.data);
      }
    } catch (err) {
      setBarcodeError('Produit non trouvé. Vous pouvez l\'ajouter manuellement.');
      console.error('Erreur recherche code-barres:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeDetected = useCallback(async (detectedBarcode) => {
    setBarcode(detectedBarcode);
    setScannerMode(false);

    try {
      setLoading(true);
      setBarcodeError('');
      const response = await axios.get(`${API_URL}/food-search/barcode/${detectedBarcode}`);

      if (response.data) {
        handleFoodSelect(response.data);
      } else {
        setBarcodeError('Produit non trouvé. Essayez une autre recherche.');
      }
    } catch (err) {
      setBarcodeError('Produit non trouvé. Entrez le code manuellement.');
      console.error('Erreur recherche code-barres:', err);
    } finally {
      setLoading(false);
    }
  }, [handleFoodSelect]);

  return (
    <div className="food-search-container">
      <div className="search-mode-tabs">
        <button
          className={`mode-tab ${searchMode === 'text' ? 'active' : ''}`}
          onClick={() => {
            setSearchMode('text');
            setBarcodeError('');
            setBarcode('');
          }}
        >
          🔍 Texte
        </button>
        <button
          className={`mode-tab ${searchMode === 'barcode' ? 'active' : ''}`}
          onClick={() => {
            setSearchMode('barcode');
            setBarcodeError('');
            setQuery('');
            setSuggestions([]);
          }}
        >
          📱 Code-barres
        </button>
      </div>

      {searchMode === 'text' ? (
        <>
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
        </>
      ) : scannerMode ? (
        <BarcodeScanner
          onBarcodeDetected={handleBarcodeDetected}
          onCancel={() => setScannerMode(false)}
        />
      ) : (
        <>
          <div className="barcode-input-wrapper">
            <input
              type="text"
              className="barcode-input"
              placeholder="Entrer le code-barres (8+ chiffres)"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value.replace(/\D/g, ''))}
              onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSearch()}
              autoFocus
            />
            <button
              className="btn-search-barcode"
              onClick={handleBarcodeSearch}
              disabled={loading || barcode.length < 8}
              title="Rechercher le code-barres"
            >
              {loading ? '⏳' : '✓'}
            </button>
          </div>
          {barcodeError && <div className="barcode-error">{barcodeError}</div>}
          <button
            className="btn-camera-scan"
            onClick={() => setScannerMode(true)}
            title="Ouvrir la caméra pour scanner"
          >
            📷 Scanner avec caméra
          </button>
          <p style={{ fontSize: '0.85rem', color: '#666', textAlign: 'center', marginTop: '0.5rem' }}>
            Note: Accordez les permissions d'accès à la caméra si demandé
          </p>
        </>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="food-suggestions">
          {suggestions.map((food) => (
            <div
              key={food.id}
              className="food-suggestion-item"
              onClick={() => handleFoodSelect(food)}
            >
              <div className="suggestion-header">
                <div className="suggestion-name">{food.name}</div>
                {food.source && <span className="suggestion-source">{food.source}</span>}
              </div>
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
