"use client";

import { motion } from "framer-motion";

type MetricCardProps = {
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  description?: string;
};

const trendConfig = {
  up: { color: "text-green-400", bg: "bg-green-500/10", icon: "↑" },
  down: { color: "text-red-400", bg: "bg-red-500/10", icon: "↓" },
  neutral: { color: "text-blue-400", bg: "bg-blue-500/10", icon: "•" },
};

export function MetricCard({ label, value, trend = "neutral", description }: MetricCardProps) {
  const config = trendConfig[trend];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 transition-all duration-300 hover:border-[var(--border-medium)] hover:bg-[var(--bg-card-hover)]"
    >
      {/* Subtle top gradient on hover */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/0 to-transparent transition-all duration-500 group-hover:via-green-500/30" />

      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-[var(--text-tertiary)]">{label}</p>
        <span className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${config.bg} ${config.color}`}>
          {config.icon}
        </span>
      </div>

      <p className="mt-3 text-2xl font-bold tracking-tight text-white">{value}</p>

      {description && (
        <p className="mt-2 text-xs leading-5 text-[var(--text-tertiary)]">{description}</p>
      )}
    </motion.div>
  );
}
