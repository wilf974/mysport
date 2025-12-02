import React, { useState, useEffect, useRef } from 'react';

function LazyImage({ src, alt, className, onLoad }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // L'image est visible, charger la source réelle
          setImageSrc(src);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: '50px' // Commencer à charger 50px avant d'être visible
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad();
    }
  };

  const handleError = () => {
    setError(true);
  };

  return (
    <div
      ref={imgRef}
      className={`lazy-image-wrapper ${isLoaded ? 'loaded' : ''} ${error ? 'error' : ''}`}
    >
      {!isLoaded && !error && (
        <div className="lazy-image-placeholder">
          <div className="spinner"></div>
        </div>
      )}
      {imageSrc && !error && (
        <img
          src={imageSrc}
          alt={alt}
          className={className}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      {error && (
        <div className="lazy-image-error">
          <span>Impossible de charger</span>
        </div>
      )}
    </div>
  );
}

export default LazyImage;
