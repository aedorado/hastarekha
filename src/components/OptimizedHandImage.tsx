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
  unoptimized?: boolean;
}

// Module-level cache of successfully loaded URLs across re-renders and re-sorts
const LOADED_IMAGE_CACHE = new Set<string>();

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
  unoptimized: propUnoptimized,
}: OptimizedHandImageProps) {
  // If already loaded previously in this session, start as loaded immediately (no spinner flicker)
  const [isLoaded, setIsLoaded] = useState(() => Boolean(src && LOADED_IMAGE_CACHE.has(src)));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (src && LOADED_IMAGE_CACHE.has(src)) {
      setIsLoaded(true);
      setHasError(false);
    } else {
      setIsLoaded(false);
      setHasError(false);
    }
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

  // Bypass Next.js dev server image-proxy bottleneck for direct fast delivery
  const shouldBypassOptimization = propUnoptimized !== undefined ? propUnoptimized : (isDataUrl || isBlobUrl || true);

  const imageProps = {
    src,
    alt,
    priority,
    draggable,
    unoptimized: shouldBypassOptimization,
    onLoad: () => {
      if (src) LOADED_IMAGE_CACHE.add(src);
      setIsLoaded(true);
    },
    onError: () => setHasError(true),
    className: `${className} transition-opacity duration-150 ${isLoaded ? 'opacity-100' : 'opacity-0'}`,
  };

  if (fill) {
    return (
      <>
        {!isLoaded && (
          <div
            className="absolute inset-0 bg-stone-100 flex items-center justify-center overflow-hidden"
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
          className="absolute inset-0 bg-stone-100 flex items-center justify-center"
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
