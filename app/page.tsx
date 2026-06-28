"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnalysisReport } from "./components/AnalysisReport";
import { DecisionBanner } from "./components/DecisionBanner";
import { ResearchProgress } from "./components/ResearchProgress";
import { SearchBar } from "./components/SearchBar";
import { SmoothScroll } from "./components/SmoothScroll";
import { Navbar } from "./components/Navbar";
import { useInvestmentResearch } from "./hooks/useInvestmentResearch";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function Home() {
  const { report, isLoading, error, currentStep, completedSteps, startResearch } = useInvestmentResearch();
  const [decisionVisible, setDecisionVisible] = useState(false);
  const hasDecision = Boolean(report?.investmentThesis && report.confidenceScore);

  useEffect(() => {
    if (!hasDecision) {
      setDecisionVisible(false);
      return;
    }
    const timeout = window.setTimeout(() => setDecisionVisible(true), 200);
    return () => window.clearTimeout(timeout);
  }, [hasDecision]);

  return (
    <SmoothScroll>
      <Navbar />

      <main className="relative min-h-screen overflow-hidden">
        {/* Background Effects */}
        <div className="pointer-events-none absolute inset-0">
          {/* Top radial gradient */}
          <div className="absolute left-1/2 top-0 h-[800px] w-[1200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(34,197,94,0.06)_0%,transparent_70%)]" />
          {/* Side accents */}
          <div className="absolute right-0 top-1/4 h-[600px] w-[400px] bg-[radial-gradient(ellipse,rgba(34,197,94,0.03)_0%,transparent_70%)]" />
          <div className="absolute left-0 top-1/2 h-[600px] w-[400px] bg-[radial-gradient(ellipse,rgba(34,197,94,0.02)_0%,transparent_70%)]" />
          {/* Dot pattern */}
          <div className="dot-pattern absolute inset-0 opacity-50" />
        </div>

        {/* Hero Section */}
        <section className="relative z-10 mx-auto max-w-7xl px-5 pb-8 pt-32 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.06)] px-4 py-2"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span className="text-xs font-medium tracking-wide text-green-400">AI-Powered Research Engine</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
            >
              <span className="gradient-text-white">Turn Company Data</span>
              <br />
              <span className="gradient-text-white">Into </span>
              <span className="gradient-text">Investment Intelligence</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8"
            >
              EquityLens evaluates companies using structured financial data, qualitative signals, and forward-looking risk modeling to deliver actionable investment decisions.
            </motion.p>

            {/* Stats row */}
            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-10 flex items-center justify-center gap-8 sm:gap-12"
            >
              {[
                { value: "7", label: "Research Nodes" },
                { value: "< 60s", label: "Full Analysis" },
                { value: "3", label: "Decision Outcomes" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-[var(--text-tertiary)] sm:text-sm">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Search Bar */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-12"
          >
            <SearchBar isLoading={isLoading} onSearch={startResearch} />
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-auto mt-6 max-w-3xl rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm leading-6 text-red-300"
              >
                <span className="mr-2 font-semibold">Error:</span>{error}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Results Section */}
        <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-12">
          <div className="mt-8 space-y-8">
            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <ResearchProgress completedSteps={completedSteps} currentStep={currentStep} />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {report && hasDecision && decisionVisible && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
                  className="mx-auto max-w-6xl space-y-8"
                >
                  <DecisionBanner
                    companyName={report.companyName}
                    confidenceScore={report.confidenceScore}
                    decision={report.decision}
                    investmentThesis={report.investmentThesis}
                    ticker={report.ticker}
                  />
                  <AnalysisReport report={report} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-[var(--border-subtle)]">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
            <p className="text-xs text-[var(--text-tertiary)]">© 2025 EquityLens AI. Research tool — not financial advice.</p>
            <div className="flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-50" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
              </span>
              <span className="text-xs text-[var(--text-tertiary)]">Systems operational</span>
            </div>
          </div>
        </footer>
      </main>
    </SmoothScroll>
  );
}
