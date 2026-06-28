"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";

type SearchBarProps = {
  onSearch: (name: string) => void;
  isLoading: boolean;
};

const companyChips = ["Apple", "Infosys", "Tesla", "Reliance Industries", "TCS"];

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const trimmed = value.trim();
    if (trimmed && !isLoading) {
      onSearch(trimmed);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <motion.form
        onSubmit={submit}
        className={`relative flex items-center gap-3 rounded-2xl border p-2 transition-all duration-300 ${
          isFocused
            ? "border-green-500/40 bg-[rgba(15,15,15,0.9)] shadow-[0_0_40px_rgba(34,197,94,0.08)]"
            : "border-[var(--border-medium)] bg-[var(--bg-card)]"
        }`}
        layout
      >
        {/* Search Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isFocused ? "#22c55e" : "#6b6b6b"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors duration-300"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        <input
          className="h-12 min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-[var(--text-tertiary)] sm:text-lg"
          disabled={isLoading}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search any public company..."
          value={value}
        />

        <button
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-500 px-6 text-sm font-semibold text-white shadow-[0_0_20px_rgba(34,197,94,0.25)] transition-all hover:shadow-[0_0_30px_rgba(34,197,94,0.35)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:px-8"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          )}
          <span>{isLoading ? "Analyzing" : "Analyze"}</span>
        </button>
      </motion.form>

      {/* Company Chips */}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {companyChips.map((company, i) => (
          <motion.button
            key={company}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.06, duration: 0.4 }}
            className="group flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2 text-[13px] font-medium text-[var(--text-secondary)] transition-all hover:border-green-500/30 hover:bg-[var(--accent-green-dim)] hover:text-green-400 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
            onClick={() => setValue(company)}
            type="button"
          >
            <span className="h-1 w-1 rounded-full bg-[var(--text-tertiary)] transition-colors group-hover:bg-green-400" />
            {company}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
