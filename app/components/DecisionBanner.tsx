"use client";

import { motion } from "framer-motion";

type DecisionBannerProps = {
  decision: string;
  confidenceScore: number;
  investmentThesis: string;
  ticker: string;
  companyName: string;
};

const decisionConfig: Record<string, { gradient: string; color: string; glow: string; bg: string }> = {
  INVEST: {
    gradient: "from-green-500 to-emerald-400",
    color: "text-green-400",
    glow: "shadow-[0_0_60px_rgba(34,197,94,0.2)]",
    bg: "bg-[rgba(34,197,94,0.04)]",
  },
  PASS: {
    gradient: "from-red-500 to-rose-400",
    color: "text-red-400",
    glow: "shadow-[0_0_60px_rgba(239,68,68,0.2)]",
    bg: "bg-[rgba(239,68,68,0.04)]",
  },
  HOLD: {
    gradient: "from-yellow-500 to-amber-400",
    color: "text-yellow-400",
    glow: "shadow-[0_0_60px_rgba(234,179,8,0.2)]",
    bg: "bg-[rgba(234,179,8,0.04)]",
  },
};

function ScoreCircle({ score, color }: { score: number; color: string }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const strokeColor =
    color === "text-green-400" ? "#22c55e" : color === "text-red-400" ? "#ef4444" : "#eab308";

  return (
    <div className="relative flex h-32 w-32 items-center justify-center sm:h-36 sm:w-36">
      <svg className="-rotate-90" width="100%" height="100%" viewBox="0 0 100 100">
        {/* Track */}
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
        {/* Progress */}
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] as const, delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${strokeColor}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className={`text-3xl font-bold ${color} sm:text-4xl`}
        >
          {score}
        </motion.span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-tertiary)]">
          Confidence
        </span>
      </div>
    </div>
  );
}

export function DecisionBanner({ decision, confidenceScore, investmentThesis, ticker, companyName }: DecisionBannerProps) {
  const config = decisionConfig[decision] ?? decisionConfig.HOLD;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
      className={`glass-card relative overflow-hidden ${config.glow}`}
    >
      {/* Gradient border top */}
      <div className={`absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r ${config.gradient}`} />

      <div className="relative z-10 p-8 sm:p-10">
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:gap-12">
          {/* Left: Decision + Details */}
          <div className="min-w-0 flex-1">
            {/* Decision label */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4 flex items-center gap-3"
            >
              <span className={`inline-flex items-center rounded-lg ${config.bg} border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-semibold uppercase tracking-widest ${config.color}`}>
                {decision === "INVEST" ? "📈" : decision === "PASS" ? "📉" : "⏸️"} {decision}
              </span>
              {ticker && (
                <span className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
                  {ticker}
                </span>
              )}
            </motion.div>

            {/* Company Name */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white sm:text-3xl"
            >
              {companyName}
            </motion.h2>

            {/* Thesis */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-[15px] leading-7 text-[var(--text-secondary)]"
            >
              {investmentThesis}
            </motion.p>
          </div>

          {/* Right: Score Circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="shrink-0"
          >
            <ScoreCircle score={confidenceScore} color={config.color} />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
