"use client";

import React from "react";

type Props = {
  status: "success" | "warning" | "danger" | "info" | "neutral";
  children?: React.ReactNode;
  className?: string;
}

export default function StatusBadge({ status, children, className }: Props) {
  const base = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border";
  const map = {
    success: "bg-[rgba(34,197,94,0.08)] text-[var(--success)] border-[rgba(34,197,94,0.18)]",
    warning: "bg-[rgba(245,158,11,0.08)] text-[var(--warning)] border-[rgba(245,158,11,0.18)]",
    danger: "bg-[rgba(239,68,68,0.10)] text-[var(--danger)] border-[rgba(239,68,68,0.24)]",
    info: "bg-[rgba(56,189,248,0.08)] text-[var(--info)] border-[rgba(56,189,248,0.18)]",
    neutral: "bg-[rgba(255,255,255,0.06)] text-secondary border-[rgba(255,255,255,0.18)]",
  } as const;
  return <span className={`${base} ${map[status]} ${className ?? ""}`}>{children}</span>;
}

