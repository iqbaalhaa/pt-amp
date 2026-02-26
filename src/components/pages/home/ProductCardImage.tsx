"use client";

import { useState } from "react";

interface ProductCardImageProps {
  image?: string | null;
  name: string;
}

export function ProductCardImage({ image, name }: ProductCardImageProps) {
  const [hasError, setHasError] = useState(false);

  // Case: No image provided
  if (!image) {
    return (
      <div className="flex flex-col items-center">
        <svg
          className="w-12 h-12 mb-2 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-sm">No Image</span>
      </div>
    );
  }

  // Case: Image provided
  return (
    <>
      {!hasError ? (
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover relative z-10"
          onError={() => setHasError(true)}
        />
      ) : null}

      {/* Fallback for Error - only show if error occurred */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
          <svg
            className="w-12 h-12 mb-2 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">Image Error</span>
        </div>
      )}
    </>
  );
}
