/**
 * Compresse une image pour réduire la taille du fichier
 * @param {string} dataUrl - Data URL de l'image
 * @param {number} maxWidth - Largeur maximale en pixels (défaut: 1200)
 * @param {number} maxHeight - Hauteur maximale en pixels (défaut: 1200)
 * @param {number} quality - Qualité de compression 0-1 (défaut: 0.85)
 * @returns {Promise<string>} - Data URL compressée
 */
export const compressImage = async (dataUrl, maxWidth = 1200, maxHeight = 1200, quality = 0.85) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;

    img.onload = () => {
      // Calculer les nouvelles dimensions
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }

      // Créer un canvas et dessiner l'image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Compresser et retourner
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      // Si erreur, retourner l'original
      resolve(dataUrl);
    };
  });
};

/**
 * Compresse plusieurs images en parallèle
 * @param {string[]} dataUrls - Tableau de data URLs
 * @param {number} maxWidth - Largeur maximale
 * @param {number} maxHeight - Hauteur maximale
 * @param {number} quality - Qualité de compression
 * @returns {Promise<string[]>} - Tableau d'URLs compressées
 */
export const compressImages = async (dataUrls, maxWidth = 1200, maxHeight = 1200, quality = 0.85) => {
  const compressed = await Promise.all(
    dataUrls.map(url => compressImage(url, maxWidth, maxHeight, quality))
  );
  return compressed;
};

/**
 * Calcule la taille d'une data URL en MB
 * @param {string} dataUrl - Data URL
 * @returns {number} - Taille en MB
 */
export const getDataUrlSize = (dataUrl) => {
  const base64 = dataUrl.split(',')[1];
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.length / (1024 * 1024); // Convertir en MB
};

/**
 * Formate la taille en MB pour l'affichage
 * @param {number} sizeInMb - Taille en MB
 * @returns {string} - Taille formatée
 */
export const formatSize = (sizeInMb) => {
  if (sizeInMb < 1) {
    return (sizeInMb * 1024).toFixed(0) + ' KB';
  }
  return sizeInMb.toFixed(2) + ' MB';
};
