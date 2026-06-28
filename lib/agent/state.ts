import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import type { FinancialData, NewsArticle } from "@/lib/types";
import { emptyFinancialData } from "@/lib/types";

const replace = <T>() =>
  Annotation<T>({
    reducer: (_current, next) => next,
    default: () => undefined as T
  });

const replaceArray = <T>() =>
  Annotation<T[]>({
    reducer: (_current, next) => next ?? [],
    default: () => []
  });

export const InvestmentResearchAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  companyName: Annotation<string>({
    reducer: (_current, next) => next,
    default: () => ""
  }),
  ticker: Annotation<string>({
    reducer: (_current, next) => next,
    default: () => ""
  }),
  exchange: Annotation<string>({
    reducer: (_current, next) => next,
    default: () => ""
  }),
  companyOverview: Annotation<string>({
    reducer: (_current, next) => next,
    default: () => ""
  }),
  sector: Annotation<string>({
    reducer: (_current, next) => next,
    default: () => ""
  }),
  industry: Annotation<string>({
    reducer: (_current, next) => next,
    default: () => ""
  }),
  financialData: Annotation<FinancialData>({
    reducer: (_current, next) => next,
    default: () => emptyFinancialData
  }),
  newsArticles: replaceArray<NewsArticle>(),
  webResearch: Annotation<string>({
    reducer: (_current, next) => next,
    default: () => ""
  }),
  competitorAnalysis: Annotation<string>({
    reducer: (_current, next) => next,
    default: () => ""
  }),
  financialAnalysis: Annotation<string>({
    reducer: (_current, next) => next,
    default: () => ""
  }),
  riskAssessment: Annotation<string>({
    reducer: (_current, next) => next,
    default: () => ""
  }),
  sentimentSummary: Annotation<string>({
    reducer: (_current, next) => next,
    default: () => ""
  }),
  decision: Annotation<"INVEST" | "PASS" | "HOLD">({
    reducer: (_current, next) => next,
    default: () => "HOLD"
  }),
  confidenceScore: Annotation<number>({
    reducer: (_current, next) => next,
    default: () => 0
  }),
  investmentThesis: Annotation<string>({
    reducer: (_current, next) => next,
    default: () => ""
  }),
  keyStrengths: replaceArray<string>(),
  keyRisks: replaceArray<string>(),
  targetHorizon: replace<"short" | "medium" | "long" | null>(),
  currentStep: Annotation<string>({
    reducer: (_current, next) => next,
    default: () => ""
  }),
  completedSteps: replaceArray<string>(),
  errors: replaceArray<string>()
});

export type InvestmentResearchState = typeof InvestmentResearchAnnotation.State;
