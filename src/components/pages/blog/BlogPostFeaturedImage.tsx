"use client";

import { useState } from "react";

interface BlogPostFeaturedImageProps {
  image?: string | null;
  title: string;
}

export function BlogPostFeaturedImage({
  image,
  title,
}: BlogPostFeaturedImageProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`w-full aspect-video rounded-2xl shadow-2xl border-4 border-white mb-12 flex items-center justify-center text-zinc-300 overflow-hidden relative group ${
        hasError ? "bg-zinc-200" : "bg-zinc-100"
      }`}
    >
      {image && !hasError ? (
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={() => setHasError(true)}
        />
      ) : hasError ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-24 h-24 text-zinc-300 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-tr from-zinc-200 to-zinc-50 group-hover:scale-105 transition-transform duration-700"></div>
          <svg
            className="w-24 h-24 opacity-20 relative z-10 drop-shadow-md"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </>
      )}
    </div>
  );
}
