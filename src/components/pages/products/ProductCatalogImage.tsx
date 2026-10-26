"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import { DEFAULT_IMAGES } from "@/lib/default-images";

interface ProductCatalogImageProps {
  image?: string | null;
  name: string;
}

export function ProductCatalogImage({ image, name }: ProductCatalogImageProps) {
  const [hasError, setHasError] = useState(false);

  const displayImage = image || DEFAULT_IMAGES.gradeA;

  return (
    <div className="aspect-[4/3] bg-zinc-100 relative overflow-hidden">
      {!hasError ? (
        <img
          src={displayImage}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 relative z-10"
          onError={() => setHasError(true)}
        />
      ) : null}

      {/* Fallback Icon - Show only on error */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-200 text-zinc-300 z-0">
          <Package className="w-16 h-16 opacity-50" />
        </div>
      )}
    </div>
  );
}
