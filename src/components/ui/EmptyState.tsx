"use client";

import React from "react";

type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ title, description, action, className }: Props) {
  return (
    <div className={`glass-card p-8 text-center ${className ?? ""}`}>
      <div className="mx-auto w-12 h-12 rounded-full bg-red-glass flex items-center justify-center text-[var(--brand)] mb-3">–</div>
      <div className="text-lg font-semibold text-primary">{title}</div>
      {description && <div className="text-secondary mt-1">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

