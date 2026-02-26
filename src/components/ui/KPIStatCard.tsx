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
    status === "success" ? "text-green-600" :
    status === "warning" ? "text-yellow-600" :
    status === "danger" ? "text-red-600" :
    status === "info" ? "text-blue-600" :
    "text-gray-600";
    
  const bgColor = 
    status === "success" ? "bg-green-100" :
    status === "warning" ? "bg-yellow-100" :
    status === "danger" ? "bg-red-100" :
    status === "info" ? "bg-blue-100" :
    "bg-gray-100";

  return (
    <GlassCard className="p-5 flex flex-col justify-between h-full min-h-[140px]">
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</div>
        {icon && (
          <div className={`p-2 rounded-lg ${bgColor} ${color}`}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="mt-auto">
        <div className="text-2xl lg:text-3xl font-bold text-gray-900 truncate" title={String(value)}>
          {value}
        </div>
        {delta && (
          <div className={`text-xs font-medium mt-1 ${color}`}>
            {delta}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

