"use client";

import React from "react";
import GlassCard from "./GlassCard";

type Props = {
  title: string;
  value: string | number;
  delta?: string;
  icon?: React.ReactNode;
  status?: "success" | "warning" | "danger" | "info";
}

export default function KPIStatCard({ title, value, delta, icon, status }: Props) {
  const color =
    status === "success" ? "text-[var(--success)]" :
    status === "warning" ? "text-[var(--warning)]" :
    status === "danger" ? "text-[var(--danger)]" :
    status === "info" ? "text-[var(--info)]" :
    "text-[var(--brand)]";

  return (
    <GlassCard className="p-4 md:p-6">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl bg-red-glass flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wide text-secondary">{title}</div>
          <div className="text-2xl md:text-3xl font-semibold text-primary">{value}</div>
        </div>
        {delta && (
          <div className={`text-sm font-medium ${color}`}>{delta}</div>
        )}
      </div>
    </GlassCard>
  );
}

