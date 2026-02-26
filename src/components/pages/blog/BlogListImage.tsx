"use client";

import { useState } from "react";
import { FileText } from "lucide-react";

interface BlogListImageProps {
  image?: string | null;
  title: string;
}

export function BlogListImage({ image, title }: BlogListImageProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="w-full h-full bg-zinc-200 group-hover:scale-105 transition-transform duration-500 relative">
      {image && !hasError ? (
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover relative z-10"
          onError={() => setHasError(true)}
        />
      ) : null}

      {/* Fallback Icon */}
      {(!image || hasError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-200 text-zinc-300 z-0">
          <FileText className="w-12 h-12 opacity-50" />
        </div>
      )}
    </div>
  );
}
