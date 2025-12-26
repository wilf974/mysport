import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook pour persister les données d'une séance d'entraînement
 * Sauvegarde dans localStorage pour survire aux rafraîchissements de page
 */
export const useWorkoutPersistence = (
  key,
  state
) => {
  const STORAGE_KEY = `workout_session_${key}`;
  const lastSavedRef = useRef(null);

  // Sauvegarder l'état dans localStorage
  const saveState = useCallback(() => {
    if (state) {
      try {
        const stateString = JSON.stringify(state);
        // Sauvegarder seulement si les données ont changé
        if (lastSavedRef.current !== stateString) {
          localStorage.setItem(STORAGE_KEY, stateString);
          lastSavedRef.current = stateString;
          console.log('💾 État sauvegardé:', STORAGE_KEY);
        }
      } catch (err) {
        console.error('Erreur lors de la sauvegarde de la séance:', err);
      }
    }
  }, [state, STORAGE_KEY]);

  // Sauvegarder à chaque changement d'état
  useEffect(() => {
    saveState();
  }, [saveState]);

  // Restaurer l'état au chargement
  const restoreState = useCallback(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        console.log('🔄 État trouvé dans localStorage:', STORAGE_KEY);
        return JSON.parse(savedState);
      } else {
        console.log('⚠️ Aucun état sauvegardé pour:', STORAGE_KEY);
      }
    } catch (err) {
      console.error('Erreur lors de la restauration de la séance:', err);
    }
    return null;
  }, [STORAGE_KEY]);

  // Effacer les données sauvegardées
  const clearSavedState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      lastSavedRef.current = null;
      console.log('🗑️ État supprimé:', STORAGE_KEY);
    } catch (err) {
      console.error('Erreur lors de la suppression de la séance:', err);
    }
  }, [STORAGE_KEY]);

  return { restoreState, clearSavedState };
};

