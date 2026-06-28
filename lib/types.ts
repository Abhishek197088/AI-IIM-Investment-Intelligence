export interface FinancialData {
  revenue: number[];
  revenueLabels: string[];
  netIncome: number[];
  grossMargin: number;
  debtToEquity: number;
  peRatio: number | null;
  revenueGrowthYoY: number;
  roe: number;
  currentRatio: number;
  freeCashFlow: number;
  marketCap: number;
  currency: string;
}

export interface NewsArticle {
  title: string;
  summary: string;
  sentiment: "positive" | "negative" | "neutral";
  date: string;
  source: string;
  url: string;
}

export interface InvestmentReport {
  companyName: string;
  ticker: string;
  exchange: string;
  companyOverview: string;
  sector: string;
  industry: string;
  financialData: FinancialData;
  newsArticles: NewsArticle[];
  webResearch: string;
  competitorAnalysis: string;
  financialAnalysis: string;
  riskAssessment: string;
  sentimentSummary: string;
  decision: "INVEST" | "PASS" | "HOLD";
  confidenceScore: number;
  investmentThesis: string;
  keyStrengths: string[];
  keyRisks: string[];
  targetHorizon: "short" | "medium" | "long" | null;
  currentStep: string;
  completedSteps: string[];
  errors: string[];
}

export type ResearchEvent =
  | { type: "step_start"; step: string; message: string }
  | { type: "step_complete"; step: string; data: Partial<InvestmentReport> }
  | { type: "complete"; report: InvestmentReport }
  | { type: "error"; message: string };

export const emptyFinancialData: FinancialData = {
  revenue: [],
  revenueLabels: [],
  netIncome: [],
  grossMargin: 0,
  debtToEquity: 0,
  peRatio: null,
  revenueGrowthYoY: 0,
  roe: 0,
  currentRatio: 0,
  freeCashFlow: 0,
  marketCap: 0,
  currency: "USD"
};

export function createEmptyReport(companyName = ""): InvestmentReport {
  return {
    companyName,
    ticker: "",
    exchange: "",
    companyOverview: "",
    sector: "",
    industry: "",
    financialData: emptyFinancialData,
    newsArticles: [],
    webResearch: "",
    competitorAnalysis: "",
    financialAnalysis: "",
    riskAssessment: "",
    sentimentSummary: "",
    decision: "HOLD",
    confidenceScore: 0,
    investmentThesis: "",
    keyStrengths: [],
    keyRisks: [],
    targetHorizon: null,
    currentStep: "",
    completedSteps: [],
    errors: []
  };
}
