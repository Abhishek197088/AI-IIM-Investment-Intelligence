"use client";

import { motion } from "framer-motion";
import type { InvestmentReport } from "@/lib/types";
import { MetricCard } from "./MetricCard";

type AnalysisReportProps = {
  report: InvestmentReport;
};

function formatCurrency(value: number, currency: string): string {
  if (!value) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function trendFromNumber(value: number): "up" | "down" | "neutral" {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "neutral";
}

function buildReportText(report: InvestmentReport): string {
  return [
    `EquityLens AI Report: ${report.companyName} (${report.ticker})`,
    `Decision: ${report.decision} (${report.confidenceScore}%)`,
    "",
    "Investment Thesis",
    report.investmentThesis,
    "",
    "Company Overview",
    report.companyOverview,
    "",
    "Financial Analysis",
    report.financialAnalysis,
    "",
    "News & Sentiment",
    report.sentimentSummary,
    ...report.newsArticles.map((a) => `- [${a.sentiment}] ${a.title}: ${a.summary}`),
    "",
    "Competitor Analysis",
    report.competitorAnalysis,
    "",
    "Risk Assessment",
    report.riskAssessment,
    "",
    "Key Strengths",
    ...report.keyStrengths.map((s) => `- ${s}`),
    "",
    "Key Risks",
    ...report.keyRisks.map((r) => `- ${r}`),
  ].join("\n");
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function SectionHeader({ icon, title, tag }: { icon: string; title: string; tag?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-green-dim)] text-sm">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {tag && (
        <span className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          {tag}
        </span>
      )}
    </div>
  );
}

export function AnalysisReport({ report }: AnalysisReportProps) {
  const currency = report.financialData.currency || "USD";

  function downloadReport() {
    const blob = new Blob([buildReportText(report)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.companyName || "investment"}-report.txt`.replace(/\s+/g, "-").toLowerCase();
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        custom={0}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-white">Research Report</h2>
          <p className="mt-1 text-sm text-[var(--text-tertiary)]">Comprehensive analysis powered by AI</p>
        </div>
        <button
          className="group flex items-center gap-2 rounded-xl border border-[var(--border-medium)] bg-[var(--bg-card)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-green-500/30 hover:text-white"
          onClick={downloadReport}
          type="button"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-y-0.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download Report
        </button>
      </motion.div>

      {/* Financial Health */}
      <motion.section
        custom={1}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="glass-card overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          <SectionHeader icon="📊" title="Financial Health" tag="Quantitative" />

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              label="Revenue Growth"
              trend={trendFromNumber(report.financialData.revenueGrowthYoY)}
              value={formatPercent(report.financialData.revenueGrowthYoY)}
            />
            <MetricCard
              label="Gross Margin"
              trend={trendFromNumber(report.financialData.grossMargin)}
              value={formatPercent(report.financialData.grossMargin)}
            />
            <MetricCard
              label="Debt / Equity"
              trend="neutral"
              value={report.financialData.debtToEquity.toFixed(2)}
            />
            <MetricCard
              label="P/E Ratio"
              trend="neutral"
              value={report.financialData.peRatio?.toFixed(1) ?? "N/A"}
            />
            <MetricCard
              label="ROE"
              trend={trendFromNumber(report.financialData.roe)}
              value={formatPercent(report.financialData.roe)}
            />
            <MetricCard
              label="Free Cash Flow"
              trend={trendFromNumber(report.financialData.freeCashFlow)}
              value={formatCurrency(report.financialData.freeCashFlow, currency)}
            />
          </div>

          {report.financialAnalysis && (
            <div className="mt-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5">
              <p className="whitespace-pre-line text-sm leading-7 text-[var(--text-secondary)]">
                {report.financialAnalysis}
              </p>
            </div>
          )}
        </div>
      </motion.section>

      {/* News & Sentiment */}
      <motion.section
        custom={2}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="glass-card overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          <SectionHeader icon="📰" title="News & Sentiment" tag="Qualitative" />

          {report.sentimentSummary && (
            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">{report.sentimentSummary}</p>
          )}

          <div className="mt-5 space-y-3">
            {report.newsArticles.map((article) => {
              const sentimentConfig = {
                positive: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
                negative: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
                neutral: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              }[article.sentiment] ?? { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" };

              return (
                <motion.article
                  key={`${article.title}-${article.url}`}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                  className="group rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5 transition-colors hover:border-[var(--border-medium)]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h4 className="text-sm font-medium leading-6 text-white">{article.title}</h4>
                    <span className={`w-fit shrink-0 rounded-md border ${sentimentConfig.border} ${sentimentConfig.bg} px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${sentimentConfig.color}`}>
                      {article.sentiment}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-tertiary)]">{article.summary}</p>
                  {article.url && (
                    <a
                      className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-green-400 transition-colors hover:text-green-300"
                      href={article.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Read source
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </a>
                  )}
                </motion.article>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Risk Assessment */}
      <motion.section
        custom={3}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="glass-card overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          <SectionHeader icon="🛡️" title="Risk Assessment" tag="Analysis" />
          <div className="mt-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5">
            <p className="whitespace-pre-line text-sm leading-7 text-[var(--text-secondary)]">
              {report.riskAssessment || "Risk assessment will appear here after analysis."}
            </p>
          </div>
        </div>
      </motion.section>

      {/* Key Strengths vs Risks */}
      <motion.section
        custom={4}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="glass-card overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          <SectionHeader icon="⚖️" title="Strengths vs Risks" />

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Strengths */}
            <div className="rounded-xl border border-green-500/10 bg-[rgba(34,197,94,0.02)] p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-green-500/10 text-xs text-green-400">↑</span>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-green-400">Strengths</h4>
              </div>
              <ul className="space-y-3">
                {report.keyStrengths.map((strength, i) => (
                  <motion.li
                    key={strength}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex gap-3 text-sm leading-6 text-[var(--text-secondary)]"
                  >
                    <svg className="mt-1 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{strength}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div className="rounded-xl border border-red-500/10 bg-[rgba(239,68,68,0.02)] p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-red-500/10 text-xs text-red-400">!</span>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-red-400">Risks</h4>
              </div>
              <ul className="space-y-3">
                {report.keyRisks.map((risk, i) => (
                  <motion.li
                    key={risk}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex gap-3 text-sm leading-6 text-[var(--text-secondary)]"
                  >
                    <svg className="mt-1 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{risk}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
