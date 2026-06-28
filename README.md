# EquityLens AI — AI-Powered Investment Research Agent

EquityLens AI is a real-time autonomous investment research agent built for analyzing public companies. Enter any company name or ticker symbol, and the agent executes a multi-stage parallel research workflow using **LangGraph**, fetching financial statements, real-time news, competitor intelligence, and synthesized valuation insights to generate an actionable **INVEST**, **PASS**, or **HOLD** report streamed directly over Server-Sent Events (SSE).

---

## 📋 Table of Contents
- [Overview](#-overview)
- [How to Run](#-how-to-run)
- [How It Works](#-how-it-works)
- [Key Decisions & Trade-offs](#-key-decisions--trade-offs)
- [Example Runs](#-example-runs)
- [What I Would Improve With More Time](#-what-i-would-improve-with-more-time)
- [🎁 Bonus Points: LLM Chat Session Logs](#-bonus-points-llm-chat-session-logs)

---

## 🔍 Overview

Analyzing public equities requires synthesizing multi-modal quantitative and qualitative signals: financial statement metrics, valuation multiples, recent news developments, and competitive market positioning. Doing this manually is time-consuming and prone to cognitive bias.

**EquityLens AI** automates this workflow using an agentic state graph pipeline. Key capabilities include:
- **Real-Time Stage Streaming**: Live progress updates for each research milestone (Ticker Lookup, Financial Statements, News Sentiment, Competitor Analysis, Risk Assessment, and Final Thesis).
- **Multi-Model Intelligence**: Combines **Groq (Llama 3.3 70B)** for ultra-fast structured research synthesis with **Google Gemini 2.5 Flash** for deep financial reasoning and risk evaluation.
- **Interactive Financial Dashboard**: Dynamic charts (Revenue & Net Income trends), risk highlights, key growth metrics, and formatted investment thesis statements.

---

## 🚀 How to Run

### Prerequisites
- Node.js 18.x or later
- npm or pnpm

### Setup Steps

1. **Navigate into the project directory**:
   ```bash
   cd ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root of the project (you can copy `.env.example`):
   ```bash
   cp .env.example .env.local
   ```
   Add your API keys to `.env.local`:
   ```env
   GOOGLE_API_KEY=your_google_gemini_api_key
   GROQ_API_KEY=your_groq_api_key
   TAVILY_API_KEY=your_tavily_api_key
   FMP_API_KEY=your_financial_modeling_prep_api_key
   DEMO_MODE=false
   ```

   *(Note: Set `DEMO_MODE=true` if you wish to run local mock evaluations without consuming live external API credits).*

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```

5. **Open the App**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ How It Works

### Architecture & Approach

The system is built on Next.js 14 (App Router) and leverages **LangGraph.js** to construct a typed cyclic state graph consisting of 7 distinct nodes:

```
                      ┌───────────────────────────────┐
                      │    researchOrchestratorNode   │
                      └──────────────┬────────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              ▼                      ▼                      ▼
    ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
    │ financialResearch │  │   newsResearch    │  │ competitorResearch│
    └─────────┬─────────┘  └─────────┬─────────┘  └─────────┬─────────┘
              │                      │                      │
              └──────────────────────┼──────────────────────┘
                                     ▼
                      ┌───────────────────────────────┐
                      │    financialAnalysisNode      │
                      └──────────────┬────────────────┘
                                     ▼
                      ┌───────────────────────────────┐
                      │      riskAssessmentNode       │
                      └──────────────┬────────────────┘
                                     ▼
                      ┌───────────────────────────────┐
                      │    investmentDecisionNode     │
                      └───────────────────────────────┘
```

1. **`researchOrchestratorNode`**: Resolves company ticker symbol, exchange details, and initiates initial web research via Tavily API.
2. **Parallel Research Fan-Out**:
   - **`financialResearchNode`**: Queries Financial Modeling Prep (FMP) API for revenue trends, net income, margins, P/E ratios, and cash flows.
   - **`newsResearchNode`**: Searches recent news headlines and performs sentiment extraction.
   - **`competitorResearchNode`**: Maps out primary market competitors and relative market share signals.
3. **Synthesis & Reasoning Fan-In**:
   - **`financialAnalysisNode`**: Uses Gemini 2.5 Flash to evaluate fundamental strength and capital allocation.
   - **`riskAssessmentNode`**: Conducts a thorough downside risk, regulatory, and macro risk audit.
   - **`investmentDecisionNode`**: Synthesizes all gathered evidence into an **INVEST / PASS / HOLD** decision, target horizon, confidence score (0-100%), and investment thesis.

---

## 💡 Key Decisions & Trade-offs

- **LangGraph over Linear Chains**: LangGraph provides a robust, state-managed execution graph with branching, state merging, and real-time streaming hooks. A simple sequential chain lacks state accumulation and parallel node execution.
- **Dual-Model Strategy**:
  - **Groq (Llama 3.3 70B)**: Chosen for orchestrating initial research steps due to its low latency and tool extraction accuracy.
  - **Gemini 2.5 Flash**: Chosen for financial analysis and final investment decision generation due to its long-context reasoning power and quality-to-cost efficiency.
- **Server-Sent Events (SSE) streaming**: Implemented over standard POST/REST endpoints to give immediate visual progress to the user as each graph node finishes execution.
- **INVEST / PASS / HOLD Framework**: While binary frameworks force a call on high-uncertainty stocks, introducing a **HOLD** option allows the agent to honestly express low-conviction or valuation-neutral scenarios.
- **Scope Trade-offs**: To focus on core research execution, full DCF modeling engines, portfolio aggregation, and user auth were left out of this initial version.

---

## 📊 Example Runs

### 1. Infosys (INFY)
- **Decision**: `INVEST`
- **Confidence**: `78%`
- **Target Horizon**: `Long`
- **Thesis Summary**: High-quality digital transformation partner benefiting from durable cloud modernization and enterprise AI integration. Strong balance sheet with minimal debt and consistent dividend payouts offsets near-term discretionary spending slowdowns.

### 2. Paytm (PAYTM)
- **Decision**: `PASS`
- **Confidence**: `72%`
- **Target Horizon**: `Short`
- **Thesis Summary**: Regulatory overhangs and intense domestic competition create significant downside uncertainty. While digital payments volume remains large, lack of proven sustained net profitability justifies a cautious stance.

### 3. Apple Inc. (AAPL)
- **Decision**: `INVEST`
- **Confidence**: `85%`
- **Target Horizon**: `Long`
- **Thesis Summary**: Ecosystem lock-in, recurring high-margin services growth, and strong shareholder yield via buybacks support a bullish outlook, even amidst elevated market valuation multiples.

---

## 📈 What I Would Improve With More Time

1. **Automated DCF Modeling Engine**: Build an interactive discounted cash flow (DCF) calculator allowing users to adjust growth rates, terminal multiples, and WACC assumptions.
2. **Portfolio Tracking & Alerts**: Support saved watchlists, real-time price triggers, and news sentiment change notifications.
3. **Exportable Analyst Reports**: Enable multi-page PDF generation complete with brand formatting, charts, and downloadable CSV data.
4. **Local Indian Market Data Enhancements**: Integrate direct regulatory filings (BSE/NSE integrations) for deeper domestic financial accuracy.

---

## 🎁 Bonus Points: LLM Chat Session Logs

As mandated by the project instructions, this application was built iteratively by pair-programming with an advanced AI Agentic Assistant (Antigravity with Gemini 3.5 Flash). 

The full chronological execution trajectory, internal agent reasoning steps, code modifications, and interaction transcripts are preserved locally within the workspace environment logs:
- Log location: `<appDataDir>/brain/<conversation-id>/.system_generated/logs/transcript.jsonl`
- Highlights of the session include prompt iteration on agent graph state schemas, API integration debugging, and environment setup.
#   A I - I I M - I n v e s t m e n t - I n t e l l i g e n c e  
 