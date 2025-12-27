"use client";

import React from "react";

export default function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  trend,
  trendLabel,
  className = "",
}) {
  const variants = {
    default: "bg-white border-slate-200",
    primary: "bg-blue-50 border-blue-200",
    secondary: "bg-slate-50 border-slate-200",
    muted: "bg-slate-100 border-slate-300",
  };

  const textVariants = {
    default: { title: "text-slate-500", value: "text-slate-800", subtitle: "text-slate-400" },
    primary: { title: "text-blue-600", value: "text-blue-700", subtitle: "text-blue-500" },
    secondary: { title: "text-slate-600", value: "text-slate-700", subtitle: "text-slate-500" },
    muted: { title: "text-slate-500", value: "text-slate-700", subtitle: "text-slate-400" },
  };

  const colors = textVariants[variant] || textVariants.default;

  return (
    <div className={`rounded-xl border p-3 sm:p-4 ${variants[variant]} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <p className={`text-[10px] sm:text-xs ${colors.title}`}>{title}</p>
        {Icon && <Icon className={`w-4 h-4 ${colors.title}`} />}
      </div>
      <p className={`text-base sm:text-xl font-bold ${colors.value}`}>{value}</p>
      {subtitle && <p className={`text-[10px] sm:text-xs ${colors.subtitle}`}>{subtitle}</p>}
      {trend !== undefined && (
        <p className={`text-[10px] sm:text-xs ${trend >= 0 ? "text-emerald-600" : "text-red-600"}`}>
          {trend >= 0 ? "+" : ""}{trend.toFixed(1)}% {trendLabel || ""}
        </p>
      )}
    </div>
  );
}