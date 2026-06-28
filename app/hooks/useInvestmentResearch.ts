"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { InvestmentReport, ResearchEvent } from "@/lib/types";
import { createEmptyReport } from "@/lib/types";

function mergeReport(current: InvestmentReport | null, next: Partial<InvestmentReport>, companyName: string): InvestmentReport {
  const base = current ?? createEmptyReport(companyName);

  return {
    ...base,
    ...next,
    financialData: next.financialData ?? base.financialData,
    newsArticles: next.newsArticles ?? base.newsArticles,
    keyStrengths: next.keyStrengths ?? base.keyStrengths,
    keyRisks: next.keyRisks ?? base.keyRisks,
    completedSteps: next.completedSteps ?? base.completedSteps,
    errors: next.errors ?? base.errors
  };
}

export function useInvestmentResearch() {
  const [report, setReport] = useState<InvestmentReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState("");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const companyRef = useRef("");

  const reset = useCallback(() => {
    readerRef.current?.cancel().catch(() => undefined);
    readerRef.current = null;
    companyRef.current = "";
    setReport(null);
    setIsLoading(false);
    setError(null);
    setCurrentStep("");
    setCompletedSteps([]);
  }, []);

  const handleEvent = useCallback((event: ResearchEvent) => {
    if (event.type === "step_start") {
      setCurrentStep(event.step);
      return;
    }

    if (event.type === "step_complete") {
      setCurrentStep(event.step);
      setCompletedSteps((previous) => Array.from(new Set([...previous, event.step])));
      setReport((previous) => mergeReport(previous, event.data, companyRef.current));
      return;
    }

    if (event.type === "complete") {
      setReport(event.report);
      setCompletedSteps(event.report.completedSteps);
      setCurrentStep(event.report.currentStep);
      setIsLoading(false);
      return;
    }

    if (event.type === "error") {
      setError(event.message);
      setIsLoading(false);
    }
  }, []);

  const startResearch = useCallback(
    async (companyName: string) => {
      const trimmed = companyName.trim();

      if (!trimmed) {
        return;
      }

      readerRef.current?.cancel().catch(() => undefined);
      companyRef.current = trimmed;
      setReport(createEmptyReport(trimmed));
      setIsLoading(true);
      setError(null);
      setCurrentStep("");
      setCompletedSteps([]);

      try {
        const response = await fetch("/api/research", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ companyName: trimmed })
        });

        if (!response.ok || !response.body) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Research request failed");
        }

        const reader = response.body.getReader();
        readerRef.current = reader;
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const messages = buffer.split("\n\n");
          buffer = messages.pop() ?? "";

          for (const message of messages) {
            const line = message.split("\n").find((entry) => entry.startsWith("data: "));

            if (!line) {
              continue;
            }

            const event = JSON.parse(line.replace(/^data:\s*/, "")) as ResearchEvent;
            handleEvent(event);
          }
        }
      } catch (caught) {
        if ((caught as DOMException).name !== "AbortError") {
          setError(caught instanceof Error ? caught.message : "Research failed");
          setIsLoading(false);
        }
      } finally {
        readerRef.current = null;
      }
    },
    [handleEvent]
  );

  useEffect(() => {
    return () => {
      readerRef.current?.cancel().catch(() => undefined);
    };
  }, []);

  return {
    report,
    isLoading,
    error,
    currentStep,
    completedSteps,
    startResearch,
    reset
  };
}
