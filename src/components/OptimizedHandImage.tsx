'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface OptimizedHandImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  draggable?: boolean;
}

export default function OptimizedHandImage({
  src,
  alt,
  className = '',
  priority = false,
  sizes,
  fill = true,
  width,
  height,
  draggable = false,
}: OptimizedHandImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div className={`bg-stone-100 flex items-center justify-center text-stone-400 ${className}`}>
        <span className="text-[10px]">No image</span>
      </div>
    );
  }

  const isDataUrl = src.startsWith('data:');
  const isBlobUrl = src.startsWith('blob:');

  // For data URLs or blob URLs, we use unoptimized mode
  const shouldBypassOptimization = isDataUrl || isBlobUrl;

  const imageProps = {
    src,
    alt,
    priority,
    draggable,
    unoptimized: shouldBypassOptimization,
    onLoad: () => setIsLoaded(true),
    onError: () => setHasError(true),
    className: `${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`,
  };

  if (fill) {
    return (
      <>
        {!isLoaded && (
          <div
            className="absolute inset-0 bg-stone-100 flex items-center justify-center animate-pulse overflow-hidden"
            aria-hidden="true"
          >
            <div className="w-5 h-5 rounded-full border-2 border-stone-200 border-t-accent-gold/60 animate-spin opacity-50" />
          </div>
        )}
        <Image
          {...imageProps}
          fill
          sizes={sizes || '(max-width: 768px) 100vw, 50vw'}
        />
      </>
    );
  }

  return (
    <div className="relative inline-block overflow-hidden">
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-stone-100 flex items-center justify-center animate-pulse"
          aria-hidden="true"
        >
          <div className="w-4 h-4 rounded-full border-2 border-stone-200 border-t-accent-gold/60 animate-spin opacity-50" />
        </div>
      )}
      <Image
        {...imageProps}
        width={width || 200}
        height={height || 200}
        sizes={sizes}
      />
    </div>
  );
}
