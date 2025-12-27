"use client";

import React from "react";

export default function SectionCard({
  title,
  subtitle,
  children,
  variant = "default",
  headerAction,
  className = "",
}) {
  const variants = {
    default: { header: "bg-slate-100", border: "border-slate-200" },
    primary: { header: "bg-blue-600 text-white", border: "border-blue-200" },
    success: { header: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
    warning: { header: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
    danger: { header: "bg-red-50", border: "border-red-200", text: "text-red-700" },
  };

  const style = variants[variant] || variants.default;

  return (
    <div className={`border rounded-lg overflow-hidden ${style.border} ${className}`}>
      {title && (
        <div className={`px-4 py-3 ${style.header} border-b flex justify-between items-center`}>
          <div>
            <h4 className={`text-sm font-semibold ${style.text || ""}`}>{title}</h4>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          {headerAction}
        </div>
      )}
      {children}
    </div>
  );
}