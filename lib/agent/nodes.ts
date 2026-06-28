import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import type { InvestmentReport, NewsArticle } from "@/lib/types";
import { emptyFinancialData } from "@/lib/types";
import type { InvestmentResearchState } from "./state";
import { financialDataTool, newsSearchTool, tickerLookupTool, webSearchTool } from "./tools";

function getResearchLLM() {
  return new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    apiKey: process.env.GROQ_API_KEY,
  });
}

function getAnalysisLLM() {
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.2
  });
}

const stepNames = {
  researchOrchestratorNode: "researchOrchestratorNode",
  financialResearchNode: "financialResearchNode",
  newsResearchNode: "newsResearchNode",
  competitorResearchNode: "competitorResearchNode",
  financialAnalysisNode: "financialAnalysisNode",
  riskAssessmentNode: "riskAssessmentNode",
  investmentDecisionNode: "investmentDecisionNode"
} as const;

function appendStep(state: InvestmentResearchState, step: string): string[] {
  return Array.from(new Set([...(state.completedSteps ?? []), step]));
}

function extractText(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item === "object" && "text" in item) {
          return String(item.text);
        }

        return "";
      })
      .join("\n");
  }

  return String(content ?? "");
}

function parseJsonFromText<T>(text: string, fallback: T): T {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}|\[[\s\S]*\]/);

    if (!match) {
      return fallback;
    }

    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return fallback;
    }
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export async function researchOrchestratorNode(state: InvestmentResearchState): Promise<Partial<InvestmentReport>> {
  const currentStep = stepNames.researchOrchestratorNode;
  const companyName = state.companyName;
  const tickerResult = parseJsonFromText<Record<string, unknown>>(
    await tickerLookupTool.invoke({ companyName }),
    {}
  );
  const ticker = String(tickerResult.ticker ?? "");
  const exchange = String(tickerResult.exchange ?? "");
  const webResearch = await webSearchTool.invoke({
    query: `${companyName} business model revenue streams market position recent strategic moves`
  });

  const response = await getResearchLLM().invoke([
    [
      "system",
      "You are a senior equity analyst. Given raw research, return valid JSON: { companyOverview, sector, industry, webResearch }. Keep companyOverview concise but specific."
    ],
    [
      "human",
      `Company: ${companyName}\nTicker guess: ${ticker}\nExchange guess: ${exchange}\nRaw research:\n${webResearch}`
    ]
  ]);
  const parsed = parseJsonFromText<Record<string, unknown>>(extractText(response.content), {});

  return {
    ticker,
    exchange,
    companyOverview: String(parsed.companyOverview ?? ""),
    sector: String(parsed.sector ?? ""),
    industry: String(parsed.industry ?? ""),
    webResearch: String(parsed.webResearch ?? webResearch),
    currentStep,
    completedSteps: appendStep(state, currentStep)
  };
}

export async function financialResearchNode(state: InvestmentResearchState): Promise<Partial<InvestmentReport>> {
  const currentStep = stepNames.financialResearchNode;
  const result = await financialDataTool.invoke({ ticker: state.ticker });
  const parsed = parseJsonFromText(result, emptyFinancialData);

  return {
    financialData: parsed,
    currentStep,
    completedSteps: appendStep(state, currentStep)
  };
}

export async function newsResearchNode(state: InvestmentResearchState): Promise<Partial<InvestmentReport>> {
  const currentStep = stepNames.newsResearchNode;
  const rawNews = await newsSearchTool.invoke({
    companyName: state.companyName,
    ticker: state.ticker || state.companyName
  });

  const response = await getResearchLLM().invoke([
    [
      "system",
      `Analyze these news articles about ${state.companyName}. For each article: assign sentiment (positive/negative/neutral), write a 1-sentence summary. Return ONLY valid JSON with this shape: { "newsArticles": NewsArticle[], "sentimentSummary": string }.`
    ],
    ["human", rawNews]
  ]);
  const parsed = parseJsonFromText<Record<string, unknown>>(extractText(response.content), {});
  const newsArticles = Array.isArray(parsed.newsArticles) ? (parsed.newsArticles as NewsArticle[]) : [];

  return {
    newsArticles,
    sentimentSummary: String(parsed.sentimentSummary ?? ""),
    currentStep,
    completedSteps: appendStep(state, currentStep)
  };
}

export async function competitorResearchNode(state: InvestmentResearchState): Promise<Partial<InvestmentReport>> {
  const currentStep = stepNames.competitorResearchNode;
  const research = await webSearchTool.invoke({
    query: `top 3 competitors of ${state.companyName} ${state.sector} market position strengths threats moat`
  });
  const response = await getResearchLLM().invoke([
    [
      "system",
      `Research the top 3 competitors of ${state.companyName} in the ${state.sector || "same"} sector. For each: name, market position, key strengths vs ${state.companyName}, threats they pose. Conclude with ${state.companyName}'s competitive moat assessment.`
    ],
    ["human", research]
  ]);

  return {
    competitorAnalysis: extractText(response.content),
    currentStep,
    completedSteps: appendStep(state, currentStep)
  };
}

export async function financialAnalysisNode(state: InvestmentResearchState): Promise<Partial<InvestmentReport>> {
  const currentStep = stepNames.financialAnalysisNode;
  const response = await getAnalysisLLM().invoke([
    [
      "system",
      "You are a CFA charterholder with 15 years at a top hedge fund. Analyze the following financial data with rigor. Cover: (1) Revenue trajectory and growth quality, (2) Profitability - gross margin, net margin trends, (3) Balance sheet health - debt levels, cash position, (4) Cash flow quality - FCF vs reported earnings, (5) Valuation - P/E vs sector average, (6) Return metrics - ROE vs cost of equity. Give a Financial Health Score from 1-10. Be specific with the actual numbers from the data."
    ],
    [
      "human",
      `Company: ${state.companyName} (${state.ticker})\nOverview: ${state.companyOverview}\nFinancial Data: ${JSON.stringify(state.financialData, null, 2)}`
    ]
  ]);

  return {
    financialAnalysis: extractText(response.content),
    currentStep,
    completedSteps: appendStep(state, currentStep)
  };
}

export async function riskAssessmentNode(state: InvestmentResearchState): Promise<Partial<InvestmentReport>> {
  const currentStep = stepNames.riskAssessmentNode;
  const response = await getAnalysisLLM().invoke([
    [
      "system",
      "You are a risk analyst at a top-tier investment bank. Based on ALL provided information about this company, identify and rate the top investment risks. Structure your output as: Business Risk, Financial Risk, Market/Macro Risk, Regulatory Risk, Competitive Risk. For each: description (2 sentences), severity (HIGH/MEDIUM/LOW). Conclude with an overall risk rating and a 1-paragraph summary."
    ],
    [
      "human",
      JSON.stringify(
        {
          companyOverview: state.companyOverview,
          financialData: state.financialData,
          financialAnalysis: state.financialAnalysis,
          newsArticles: state.newsArticles,
          sentimentSummary: state.sentimentSummary,
          competitorAnalysis: state.competitorAnalysis
        },
        null,
        2
      )
    ]
  ]);

  return {
    riskAssessment: extractText(response.content),
    currentStep,
    completedSteps: appendStep(state, currentStep)
  };
}

export async function investmentDecisionNode(state: InvestmentResearchState): Promise<Partial<InvestmentReport>> {
  const currentStep = stepNames.investmentDecisionNode;
  const response = await getAnalysisLLM().invoke([
    [
      "system",
      `You are the Chief Investment Officer of a $10B fund. You have reviewed all research on ${state.companyName}. Make a DEFINITIVE investment call. You MUST choose one: INVEST, PASS, or HOLD.

Return ONLY valid JSON with this exact structure:
{
  "decision": "INVEST" | "PASS" | "HOLD",
  "confidenceScore": number,
  "investmentThesis": string,
  "keyStrengths": string[],
  "keyRisks": string[],
  "targetHorizon": "short" | "medium" | "long" | null
}

Be decisive. A 50/50 hedge is not acceptable. Confidence below 40 should be HOLD. Above 60 leaning INVEST or PASS.`
    ],
    [
      "human",
      JSON.stringify(
        {
          companyName: state.companyName,
          ticker: state.ticker,
          exchange: state.exchange,
          overview: state.companyOverview,
          financialData: state.financialData,
          financialAnalysis: state.financialAnalysis,
          sentimentSummary: state.sentimentSummary,
          newsArticles: state.newsArticles,
          competitorAnalysis: state.competitorAnalysis,
          riskAssessment: state.riskAssessment
        },
        null,
        2
      )
    ]
  ]);

  const parsed = parseJsonFromText<Record<string, unknown>>(extractText(response.content), {});
  const decision = parsed.decision === "INVEST" || parsed.decision === "PASS" || parsed.decision === "HOLD" ? parsed.decision : "HOLD";
  const targetHorizon =
    parsed.targetHorizon === "short" || parsed.targetHorizon === "medium" || parsed.targetHorizon === "long"
      ? parsed.targetHorizon
      : null;

  return {
    decision,
    confidenceScore: Number(parsed.confidenceScore ?? 0),
    investmentThesis: String(parsed.investmentThesis ?? ""),
    keyStrengths: Array.isArray(parsed.keyStrengths) ? parsed.keyStrengths.map(String).slice(0, 3) : [],
    keyRisks: Array.isArray(parsed.keyRisks) ? parsed.keyRisks.map(String).slice(0, 3) : [],
    targetHorizon,
    currentStep,
    completedSteps: appendStep(state, currentStep)
  };
}
