"use client";

import { motion, AnimatePresence } from "framer-motion";

type ResearchProgressProps = {
  currentStep: string;
  completedSteps: string[];
};

const steps = [
  ["researchOrchestratorNode", "Company Research", "Identifying company and gathering background intelligence"],
  ["financialResearchNode", "Financial Data", "Fetching financial statements, ratios, and profile data"],
  ["newsResearchNode", "News Analysis", "Scanning recent news and evaluating market sentiment"],
  ["competitorResearchNode", "Competitor Analysis", "Mapping competitive landscape and market positioning"],
  ["financialAnalysisNode", "Financial Analysis", "Running deep financial health and valuation analysis"],
  ["riskAssessmentNode", "Risk Assessment", "Evaluating business, financial, and market risks"],
  ["investmentDecisionNode", "Investment Decision", "Synthesizing research into a definitive investment call"],
] as const;

const icons: Record<string, string> = {
  researchOrchestratorNode: "🔍",
  financialResearchNode: "📊",
  newsResearchNode: "📰",
  competitorResearchNode: "⚔️",
  financialAnalysisNode: "🧮",
  riskAssessmentNode: "🛡️",
  investmentDecisionNode: "🎯",
};

export function ResearchProgress({ currentStep, completedSteps }: ResearchProgressProps) {
  const progress = (completedSteps.length / steps.length) * 100;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-3xl"
    >
      {/* Header */}
      <div className="glass-card p-6">
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-green-dim)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Research in Progress</h2>
              <p className="text-xs text-[var(--text-tertiary)]">{completedSteps.length} of {steps.length} stages complete</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-green-400">{Math.round(progress)}%</span>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400 shadow-[0_0_12px_rgba(34,197,94,0.4)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>

        {/* Steps */}
        <div className="mt-6 space-y-1">
          {steps.map(([id, label, description], index) => {
            const complete = completedSteps.includes(id);
            const active = currentStep === id && !complete;
            const pending = !complete && !active;

            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-300 ${
                  active
                    ? "bg-[var(--accent-green-dim)] border border-green-500/20"
                    : complete
                    ? "bg-transparent"
                    : "bg-transparent opacity-40"
                }`}
              >
                {/* Status indicator */}
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                  <AnimatePresence mode="wait">
                    {complete ? (
                      <motion.div
                        key="done"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/15"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </motion.div>
                    ) : active ? (
                      <motion.div
                        key="active"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="relative flex h-8 w-8 items-center justify-center"
                      >
                        <span className="absolute h-8 w-8 rounded-full border-2 border-green-500/20 pulse-ring" />
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-green-400/30 border-t-green-400" />
                      </motion.div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                        <span className="text-xs text-[var(--text-tertiary)]">{index + 1}</span>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Label */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{icons[id]}</span>
                    <p className={`text-sm font-medium ${active ? "text-green-400" : complete ? "text-white" : "text-[var(--text-tertiary)]"}`}>
                      {label}
                    </p>
                  </div>
                  {(active || complete) && (
                    <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">{description}</p>
                  )}
                </div>

                {/* Status text */}
                <span className={`text-xs font-medium ${
                  complete ? "text-green-400" : active ? "text-green-400" : "text-[var(--text-tertiary)]"
                }`}>
                  {complete ? "Done" : active ? "Running..." : "Pending"}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
