"use client";

import { useState } from "react";

interface HomeBlogImageProps {
  image?: string | null;
  title: string;
}

export function HomeBlogImage({ image, title }: HomeBlogImageProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="h-48 bg-zinc-100 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center text-zinc-400">
        {image && !hasError ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
            onError={() => setHasError(true)}
          />
        ) : null}
        
        {/* Fallback Icon */}
        {(!image || hasError) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-12 h-12 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
