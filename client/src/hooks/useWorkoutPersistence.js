import { useEffect } from 'react';

/**
 * Hook pour persister les données d'une séance d'entraînement
 * Sauvegarde dans localStorage pour survire aux rafraîchissements de page
 */
export const useWorkoutPersistence = (
  key,
  state,
  setState
) => {
  const STORAGE_KEY = `workout_session_${key}`;

  // Sauvegarder l'état dans localStorage à chaque changement
  useEffect(() => {
    if (state) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error('Erreur lors de la sauvegarde de la séance:', err);
      }
    }
  }, [state, STORAGE_KEY]);

  // Restaurer l'état au chargement
  const restoreState = () => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (err) {
      console.error('Erreur lors de la restauration de la séance:', err);
    }
    return null;
  };

  // Effacer les données sauvegardées
  const clearSavedState = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('Erreur lors de la suppression de la séance:', err);
    }
  };

  return { restoreState, clearSavedState };
};
