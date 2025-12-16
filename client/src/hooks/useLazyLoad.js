import { useEffect, useRef, useState } from 'react';

/**
 * Hook pour lazy loader les images avec intersection observer
 * Optimise la performance en chargeant les images au moment de l'affichage
 */
export const useLazyLoad = (options = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsLoaded(true);
        observer.unobserve(entry.target);
      }
    }, {
      rootMargin: '50px', // Charger 50px avant d'arriver à l'écran
      threshold: 0.01,
      ...options
    });

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [options]);

  return { elementRef, isLoaded };
};

export default useLazyLoad;
