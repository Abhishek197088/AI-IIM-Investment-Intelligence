import { END, START, StateGraph } from "@langchain/langgraph";
import type { InvestmentReport, ResearchEvent } from "@/lib/types";
import { createEmptyReport, emptyFinancialData } from "@/lib/types";
import {
  competitorResearchNode,
  financialAnalysisNode,
  financialResearchNode,
  investmentDecisionNode,
  newsResearchNode,
  researchOrchestratorNode,
  riskAssessmentNode
} from "./nodes";
import { InvestmentResearchAnnotation } from "./state";

const stepMessages: Record<string, string> = {
  researchOrchestratorNode: "Identifying company and gathering background...",
  financialResearchNode: "Fetching financial statements and ratios...",
  newsResearchNode: "Scanning recent news and sentiment...",
  competitorResearchNode: "Mapping the competitive landscape...",
  financialAnalysisNode: "Running financial analysis...",
  riskAssessmentNode: "Assessing investment risks...",
  investmentDecisionNode: "Making investment decision..."
};

const orderedSteps = Object.keys(stepMessages);

function buildGraph() {
  return new StateGraph(InvestmentResearchAnnotation)
    .addNode("researchOrchestratorNode", researchOrchestratorNode)
    .addNode("financialResearchNode", financialResearchNode)
    .addNode("newsResearchNode", newsResearchNode)
    .addNode("competitorResearchNode", competitorResearchNode)
    .addNode("financialAnalysisNode", financialAnalysisNode)
    .addNode("riskAssessmentNode", riskAssessmentNode)
    .addNode("investmentDecisionNode", investmentDecisionNode)
    .addEdge(START, "researchOrchestratorNode")
    .addEdge("researchOrchestratorNode", "financialResearchNode")
    .addEdge("researchOrchestratorNode", "newsResearchNode")
    .addEdge("researchOrchestratorNode", "competitorResearchNode")
    .addEdge(["financialResearchNode", "newsResearchNode", "competitorResearchNode"], "financialAnalysisNode")
    .addEdge("financialAnalysisNode", "riskAssessmentNode")
    .addEdge("riskAssessmentNode", "investmentDecisionNode")
    .addEdge("investmentDecisionNode", END)
    .compile();
}

function mergeReport(current: InvestmentReport, next: Partial<InvestmentReport>, completedStep?: string): InvestmentReport {
  const completedSteps = completedStep
    ? Array.from(new Set([...(current.completedSteps ?? []), completedStep]))
    : current.completedSteps;

  return {
    ...current,
    ...next,
    financialData: next.financialData ?? current.financialData,
    newsArticles: next.newsArticles ?? current.newsArticles,
    keyStrengths: next.keyStrengths ?? current.keyStrengths,
    keyRisks: next.keyRisks ?? current.keyRisks,
    completedSteps,
    errors: next.errors ?? current.errors
  };
}

function createMockReport(companyName: string): InvestmentReport {
  return {
    ...createEmptyReport(companyName || "Infosys"),
    companyName: companyName || "Infosys",
    ticker: "INFY",
    exchange: "NSE",
    companyOverview:
      "Infosys is a global IT services and consulting company with durable enterprise relationships, strong offshore delivery capabilities, and growing exposure to cloud, data, AI, and digital transformation programs.",
    sector: "Information Technology",
    industry: "IT Services",
    financialData: {
      revenue: [1230000000000, 1467000000000, 1537000000000],
      revenueLabels: ["FY2023", "FY2024", "FY2025"],
      netIncome: [240000000000, 263000000000, 266000000000],
      grossMargin: 30.8,
      debtToEquity: 0.09,
      peRatio: 24.6,
      revenueGrowthYoY: 4.8,
      roe: 31.2,
      currentRatio: 2.1,
      freeCashFlow: 238000000000,
      marketCap: 6900000000000,
      currency: "INR"
    },
    newsArticles: [
      {
        title: "Infosys expands enterprise AI services pipeline",
        summary: "Recent contract wins point to steady demand for AI-led transformation work among large enterprise clients.",
        sentiment: "positive",
        date: "2025-04-18",
        source: "Demo News",
        url: "https://example.com/infosys-ai-pipeline"
      },
      {
        title: "IT services sector faces discretionary spending pressure",
        summary: "Clients remain cautious on non-critical technology projects, which may cap near-term revenue acceleration.",
        sentiment: "neutral",
        date: "2025-03-27",
        source: "Demo News",
        url: "https://example.com/it-services-pressure"
      }
    ],
    webResearch:
      "Infosys serves global enterprises across financial services, retail, manufacturing, and communications. Its strategic focus is cloud migration, data modernization, AI services, cybersecurity, and managed digital operations.",
    competitorAnalysis:
      "Key competitors include TCS, Accenture, and Wipro. Infosys has a strong delivery reputation and high return metrics, while Accenture remains more diversified globally and TCS benefits from greater scale in India-listed IT services.",
    financialAnalysis:
      "Financial Health Score: 8/10. Revenue has compounded steadily, margins remain resilient for a services business, leverage is low, cash conversion is strong, and ROE is materially above a typical cost of equity. Valuation is not cheap, but the premium is supported by quality and balance-sheet strength.",
    riskAssessment:
      "Business Risk: Demand for discretionary transformation programs can slow during enterprise budget tightening. Severity: MEDIUM.\nFinancial Risk: Low leverage and strong cash flow reduce financial fragility. Severity: LOW.\nMarket/Macro Risk: Currency swings and global recession risk can pressure growth. Severity: MEDIUM.\nRegulatory Risk: Cross-border data, immigration, and outsourcing rules remain recurring exposures. Severity: MEDIUM.\nCompetitive Risk: TCS, Accenture, and global consulting firms compete aggressively on large transformation deals. Severity: MEDIUM.",
    sentimentSummary:
      "Recent news flow is modestly positive, led by AI and digital transformation demand, while sector-wide discretionary spending pressure remains a watch item.",
    decision: "INVEST",
    confidenceScore: 78,
    investmentThesis:
      "Infosys screens as a quality compounder with high ROE, low leverage, strong free cash flow, and credible exposure to enterprise digital transformation and AI services. The valuation requires continued execution, but the balance of durable client relationships, operating discipline, and technology spending tailwinds supports an INVEST call for long-horizon investors.",
    keyStrengths: [
      "High-quality balance sheet with low debt and strong free cash flow conversion.",
      "Durable enterprise client base with growing AI, cloud, and data modernization demand.",
      "ROE and margin profile remain attractive relative to many global IT services peers."
    ],
    keyRisks: [
      "Discretionary technology spending can weaken during macro slowdowns.",
      "Competitive pricing pressure from TCS, Accenture, Wipro, and global consultancies.",
      "Currency, wage inflation, and regulatory changes can compress margins."
    ],
    targetHorizon: "long",
    currentStep: "investmentDecisionNode",
    completedSteps: orderedSteps,
    errors: []
  };
}

async function* streamMockResearch(companyName: string): AsyncGenerator<ResearchEvent> {
  const report = createMockReport(companyName);
  let partialReport = createEmptyReport(companyName);

  for (const step of orderedSteps) {
    yield { type: "step_start", step, message: stepMessages[step] };
    const stepData: Partial<InvestmentReport> =
      step === "researchOrchestratorNode"
        ? {
            companyName: report.companyName,
            ticker: report.ticker,
            exchange: report.exchange,
            companyOverview: report.companyOverview,
            sector: report.sector,
            industry: report.industry,
            webResearch: report.webResearch,
            currentStep: step
          }
        : step === "financialResearchNode"
          ? { financialData: report.financialData, currentStep: step }
          : step === "newsResearchNode"
            ? { newsArticles: report.newsArticles, sentimentSummary: report.sentimentSummary, currentStep: step }
            : step === "competitorResearchNode"
              ? { competitorAnalysis: report.competitorAnalysis, currentStep: step }
              : step === "financialAnalysisNode"
                ? { financialAnalysis: report.financialAnalysis, currentStep: step }
                : step === "riskAssessmentNode"
                  ? { riskAssessment: report.riskAssessment, currentStep: step }
                  : {
                      decision: report.decision,
                      confidenceScore: report.confidenceScore,
                      investmentThesis: report.investmentThesis,
                      keyStrengths: report.keyStrengths,
                      keyRisks: report.keyRisks,
                      targetHorizon: report.targetHorizon,
                      currentStep: step
                    };

    partialReport = mergeReport(partialReport, stepData, step);
    yield { type: "step_complete", step, data: { ...stepData, completedSteps: partialReport.completedSteps } };
  }

  yield { type: "complete", report };
}

export async function* streamInvestmentResearch(companyName: string): AsyncGenerator<ResearchEvent> {
  if (process.env.DEMO_MODE === "true") {
    yield* streamMockResearch(companyName);
    return;
  }

  const graph = buildGraph();
  let report = {
    ...createEmptyReport(companyName),
    financialData: emptyFinancialData
  };

  try {
    const stream = await graph.stream(report, { streamMode: "updates" });

    for await (const chunk of stream) {
      for (const [step, data] of Object.entries(chunk as Record<string, Partial<InvestmentReport>>)) {
        if (!stepMessages[step]) {
          continue;
        }

        yield { type: "step_start", step, message: stepMessages[step] };
        report = mergeReport(report, data, step);
        yield {
          type: "step_complete",
          step,
          data: {
            ...data,
            completedSteps: report.completedSteps
          }
        };
      }
    }

    yield { type: "complete", report };
  } catch (error) {
    yield {
      type: "error",
      message: error instanceof Error ? error.message : "Investment research failed"
    };
  }
}
