import React from 'react';
import { useTheme } from '../hooks/useTheme';
import './ThemeToggle.css';

/**
 * Composant bouton pour basculer le thème clair/sombre
 * Affiche une icône de soleil/lune
 */
function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      {isDark ? (
        <span className="theme-icon">☀️</span>
      ) : (
        <span className="theme-icon">🌙</span>
      )}
    </button>
  );
}

export default ThemeToggle;
