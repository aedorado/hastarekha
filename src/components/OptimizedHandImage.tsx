'use client';

import React, { useState } from 'react';
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
      <Image
        {...imageProps}
        fill
        sizes={sizes || '(max-width: 768px) 100vw, 50vw'}
      />
    );
  }

  return (
    <Image
      {...imageProps}
      width={width || 200}
      height={height || 200}
      sizes={sizes}
    />
  );
}
