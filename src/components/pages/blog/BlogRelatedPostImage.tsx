"use client";

import { useState } from "react";

interface BlogRelatedPostImageProps {
  image?: string | null;
  title: string;
}

export function BlogRelatedPostImage({
  image,
  title,
}: BlogRelatedPostImageProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="h-48 bg-zinc-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
      {image && !hasError ? (
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setHasError(true)}
        />
      ) : null}

      {/* Fallback Icon - Show if no image OR if error */}
      {(!image || hasError) && (
        <div className="w-full h-full bg-zinc-200 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-zinc-400 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
