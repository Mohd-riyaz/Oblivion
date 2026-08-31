import { useState } from 'react';
import { Music } from 'lucide-react';

interface ArtworkProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export default function Artwork({ src, alt, className = '' }: ArtworkProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (!src || hasError) {
    return (
      <div className={`bg-gradient-to-br from-muted to-surface flex items-center justify-center ${className}`}>
        <Music className="w-1/3 h-1/3 text-muted-foreground/50" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ease-out ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </div>
  );
}
