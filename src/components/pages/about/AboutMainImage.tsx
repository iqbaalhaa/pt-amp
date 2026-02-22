"use client";

import { useState } from "react";
import { Factory } from "lucide-react";

interface AboutMainImageProps {
  image?: string | null;
}

export function AboutMainImage({ image }: AboutMainImageProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="order-1 md:order-2 bg-zinc-100 rounded-3xl overflow-hidden aspect-square relative group">
      {image && !hasError ? (
        <img
          src={image}
          alt="Gudang Kulit Manis"
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : null}
      {(!image || hasError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-200 text-zinc-300">
          <Factory className="w-24 h-24 opacity-50" />
        </div>
      )}
    </div>
  );
}
