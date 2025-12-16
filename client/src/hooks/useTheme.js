import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour gérer le thème clair/sombre
 * Persiste la préférence dans localStorage
 */
export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    // Vérifier la préférence sauvegardée
    const saved = localStorage.getItem('theme-preference');
    if (saved) {
      return saved;
    }

    // Détecter la préférence du système
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  });

  // Appliquer le thème au document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme-preference', theme);
  }, [theme]);

  // Fonction pour basculer le thème
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Fonction pour définir un thème spécifique
  const setThemeMode = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
    }
  };

  return {
    theme,
    toggleTheme,
    setThemeMode,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };
};

export default useTheme;
