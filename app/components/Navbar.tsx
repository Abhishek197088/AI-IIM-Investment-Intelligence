"use client";

import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
      className="fixed left-0 right-0 top-0 z-50 border-b border-[var(--border-subtle)] bg-[rgba(5,5,5,0.8)] backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-wide text-white">
            EquityLens<span className="ml-1 text-green-400">AI</span>
          </span>
        </div>

        {/* Nav Links */}
        <nav className="hidden items-center gap-8 md:flex">
          {["Research", "Analysis", "Decisions"].map((item) => (
            <span
              key={item}
              className="cursor-default text-[13px] font-medium text-[var(--text-tertiary)] transition-colors hover:text-white"
            >
              {item}
            </span>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 sm:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-50" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
            </span>
            <span className="text-[11px] font-medium text-[var(--text-tertiary)]">Live</span>
          </div>
          <button className="rounded-lg bg-white px-4 py-2 text-[13px] font-semibold text-black transition-all hover:bg-gray-200 active:scale-[0.97]">
            Get Started
          </button>
        </div>
      </div>
    </motion.header>
  );
}
