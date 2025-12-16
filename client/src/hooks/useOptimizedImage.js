/**
 * Hook pour optimiser les images avec différentes résolutions
 * Adapte la taille de l'image en fonction de l'écran
 */
export const useOptimizedImage = (basePath, alt = '') => {
  // Détecter la résolution de l'écran
  const devicePixelRatio = window.devicePixelRatio || 1;
  const screenWidth = window.innerWidth;

  // Déterminer la taille optimale en fonction de la largeur d'écran
  let imageSize = 'sm';
  if (screenWidth > 1024) {
    imageSize = 'lg';
  } else if (screenWidth > 768) {
    imageSize = 'md';
  } else if (screenWidth > 480) {
    imageSize = 'sm';
  } else {
    imageSize = 'xs';
  }

  // Construire le srcSet pour les images responsives
  const srcSet = [
    `${basePath}?w=320&q=80 320w`,
    `${basePath}?w=640&q=80 640w`,
    `${basePath}?w=1024&q=85 1024w`,
    `${basePath}?w=1920&q=90 1920w`
  ].join(', ');

  // Déterminer l'URL de base optimale
  const optimizedUrl = `${basePath}?w=${screenWidth * devicePixelRatio}&q=80`;

  return {
    src: optimizedUrl,
    srcSet,
    sizes: '(max-width: 480px) 100vw, (max-width: 768px) 90vw, 80vw',
    alt,
    imageSize
  };
};

export default useOptimizedImage;
