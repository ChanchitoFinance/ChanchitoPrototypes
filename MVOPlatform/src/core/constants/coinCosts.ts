/**
 * Canonical coin costs – single source of truth (Decision Clarity spec).
 * Use these constants everywhere that spends or displays coin costs.
 */
export const PERSONA_PANEL = 10
export const DEEP_RESEARCH = 30
export const FULL_SYNTHESIS = 40
export const RE_RUN = 10
export const RISK_HIGHLIGHTER = 10

/** Coin packages added on purchase (Starter / Builder / Operator) */
export const PLAN_COINS = {
  starter: 100,
  builder: 250,
  operator: 500,
} as const
