"use client";

import React from "react";

type Props = {
  className?: string;
}

export default function Skeleton({ className }: Props) {
  return (
    <div className={`relative overflow-hidden bg-[rgba(255,255,255,0.06)] ${className ?? ""}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.12)] to-transparent" />
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
    </div>
  );
}

