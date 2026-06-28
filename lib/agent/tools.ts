import { DynamicStructuredTool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";
import type { FinancialData } from "@/lib/types";
import { emptyFinancialData } from "@/lib/types";

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
  snippet?: string;
  published_date?: string;
  score?: number;
};

type TavilyResponse = {
  results?: TavilyResult[];
  answer?: string;
};

async function tavilySearch(query: string, options: Record<string, unknown> = {}): Promise<TavilyResponse> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    return { results: [] };
  }

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "advanced",
      include_answer: true,
      max_results: 5,
      ...options
    })
  });

  if (!response.ok) {
    throw new Error(`Tavily search failed with ${response.status}`);
  }

  return (await response.json()) as TavilyResponse;
}

function inferTicker(text: string): { ticker: string; exchange: "NYSE" | "NASDAQ" | "NSE" | "BSE" | "" } {
  const normalized = text.toUpperCase();
  const exchangeMatch = normalized.match(/\b(NYSE|NASDAQ|NSE|BSE)\b/);

  // Try explicit "EXCHANGE: TICKER" patterns first
  let explicitMatch = normalized.match(/\b(?:NYSE|NASDAQ|NSE|BSE)\s*[:\-]\s*([A-Z0-9.\-]{1,12})\b/);
  if (explicitMatch && explicitMatch[1] === "LISTED") {
    explicitMatch = null;
  }

  // Match Indian tickers with exchange suffix
  const indianMatch = normalized.match(/\b([A-Z]{1,12}\.(?:NS|BO))\b/);

  // Yahoo Finance style: Company Name (AAPL)
  const bracketMatch = normalized.match(/\(\s*([A-Z]{1,6})\s*\)/);

  // Fallback: "TICKER IS …" or "TICKER SYMBOL: …"
  const labelMatch = normalized.match(/\bTICKER(?:\s+SYMBOL)?\s+(?:IS|:)\s+([A-Z0-9.\-]{1,12})\b/);

  const tickerMatch = explicitMatch ?? indianMatch ?? bracketMatch ?? labelMatch;
  let ticker = tickerMatch?.[1]?.replace(/[.,;)]$/, "") ?? "";
  if (ticker === "LISTED") ticker = "";

  // Derive exchange: prefer explicit tag, then infer from .NS/.BO suffix
  let exchange: "NYSE" | "NASDAQ" | "NSE" | "BSE" | "" =
    (exchangeMatch?.[1] as "NYSE" | "NASDAQ" | "NSE" | "BSE" | undefined) ?? "";

  if (!exchange && ticker.endsWith(".NS")) {
    exchange = "NSE";
  } else if (!exchange && ticker.endsWith(".BO")) {
    exchange = "BSE";
  }

  return { ticker, exchange };
}

function safeNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export const tickerLookupTool = new DynamicStructuredTool({
  name: "ticker_lookup",
  description: "Finds the ticker symbol and exchange for a public company.",
  schema: z.object({
    companyName: z.string().min(1)
  }),
  func: async ({ companyName }) => {
    try {
      const query = `stock ticker symbol for ${companyName} site:finance.yahoo.com OR site:nseindia.com`;
      const response = await tavilySearch(query, { max_results: 5 });
      const combined = [response.answer, ...(response.results ?? []).map((result) => `${result.title} ${result.content}`)]
        .filter(Boolean)
        .join("\n");
      const inferred = inferTicker(combined);

      return JSON.stringify({
        ticker: inferred.ticker,
        exchange: inferred.exchange,
        rawResults: response.results ?? []
      });
    } catch (error) {
      return JSON.stringify({
        ticker: "",
        exchange: "",
        error: error instanceof Error ? error.message : "Ticker lookup failed"
      });
    }
  }
});

export const webSearchTool = new DynamicStructuredTool({
  name: "web_search",
  description: "Searches the web for investment research context.",
  schema: z.object({
    query: z.string().min(1)
  }),
  func: async ({ query }) => {
    try {
      const response = await tavilySearch(query, {
        search_depth: "advanced",
        max_results: 5
      });

      return (response.results ?? [])
        .map((result, index) => {
          const title = result.title ?? `Result ${index + 1}`;
          const content = result.content ?? result.snippet ?? "";
          return `${title}\n${content}\n${result.url ?? ""}`;
        })
        .join("\n\n");
    } catch (error) {
      return `Web search failed: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  }
});

export const newsSearchTool = new DynamicStructuredTool({
  name: "news_search",
  description: "Finds recent financial news for a company.",
  schema: z.object({
    companyName: z.string().min(1),
    ticker: z.string().min(1)
  }),
  func: async ({ companyName, ticker }) => {
    try {
      const response = await tavilySearch(`${companyName} ${ticker} financial news 2024 2025`, {
        topic: "news",
        max_results: 8
      });

      return JSON.stringify(
        (response.results ?? []).slice(0, 8).map((result) => ({
          title: result.title ?? "Untitled article",
          url: result.url ?? "",
          snippet: result.content ?? result.snippet ?? "",
          publishedDate: result.published_date ?? ""
        }))
      );
    } catch (error) {
      return JSON.stringify([
        {
          title: "News search unavailable",
          url: "",
          snippet: error instanceof Error ? error.message : "Unknown error",
          publishedDate: ""
        }
      ]);
    }
  }
});

export const financialDataTool = new DynamicStructuredTool({
  name: "financial_data",
  description: "Fetches financial statements, ratios, and profile data from Financial Modeling Prep.",
  schema: z.object({
    ticker: z.string().min(1)
  }),
  func: async ({ ticker }) => {
    const apiKey = process.env.FMP_API_KEY;

    if (!apiKey) {
      return JSON.stringify({
        ...emptyFinancialData,
        currency: "USD"
      });
    }

    try {
      const baseUrl = "https://financialmodelingprep.com/stable";
      const params = { apikey: apiKey, symbol: ticker };
      const [profileResponse, incomeResponse, ratiosResponse, cashFlowResponse] = await Promise.all([
        axios.get(`${baseUrl}/profile`, { params }),
        axios.get(`${baseUrl}/income-statement`, { params: { ...params, limit: 3 } }),
        axios.get(`${baseUrl}/ratios`, { params: { ...params, limit: 1 } }),
        axios.get(`${baseUrl}/cash-flow-statement`, { params: { ...params, limit: 1 } })
      ]);

      const profile = profileResponse.data?.[0] ?? {};
      const incomeStatements = Array.isArray(incomeResponse.data) ? incomeResponse.data : [];
      const latestIncome = incomeStatements[0] ?? {};
      const previousIncome = incomeStatements[1] ?? {};
      const ratios = ratiosResponse.data?.[0] ?? {};
      const cashFlow = cashFlowResponse.data?.[0] ?? {};

      if (!profileResponse.data?.length && !incomeStatements.length) {
        const fallback = await tavilySearch(`annual revenue profit margins ${ticker} financial results 2024`, {
          max_results: 5
        });

        return JSON.stringify({
          ...emptyFinancialData,
          currency: "USD",
          fallbackResearch: fallback.results ?? []
        });
      }

      const revenue = incomeStatements.map((statement) => safeNumber(statement.revenue)).reverse();
      const netIncome = incomeStatements.map((statement) => safeNumber(statement.netIncome)).reverse();
      const revenueLabels = incomeStatements.map((statement) => String(statement.calendarYear ?? statement.date ?? "")).reverse();
      const latestRevenue = safeNumber(latestIncome.revenue);
      const previousRevenue = safeNumber(previousIncome.revenue);
      const revenueGrowthYoY = previousRevenue ? ((latestRevenue - previousRevenue) / Math.abs(previousRevenue)) * 100 : 0;
      const grossProfit = safeNumber(latestIncome.grossProfit);
      const grossMargin = latestRevenue ? (grossProfit / latestRevenue) * 100 : 0;

      const financialData: FinancialData = {
        revenue,
        revenueLabels,
        netIncome,
        grossMargin,
        debtToEquity: safeNumber(ratios.debtEquityRatio),
        peRatio: ratios.priceEarningsRatio ? safeNumber(ratios.priceEarningsRatio) : null,
        revenueGrowthYoY,
        roe: safeNumber(ratios.returnOnEquity) * 100,
        currentRatio: safeNumber(ratios.currentRatio),
        freeCashFlow: safeNumber(cashFlow.freeCashFlow),
        marketCap: safeNumber(profile.mktCap),
        currency: profile.currency ?? "USD"
      };

      return JSON.stringify(financialData);
    } catch (error) {
      return JSON.stringify({
        ...emptyFinancialData,
        currency: "USD",
        error: error instanceof Error ? error.message : "Financial data fetch failed"
      });
    }
  }
});
