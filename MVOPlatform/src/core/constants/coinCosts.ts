/**
 * Canonical coin costs – single source of truth (Decision Clarity spec).
 * Use these constants everywhere that spends or displays coin costs.
 */
export const PERSONA_PANEL = 10
export const RISK_HIGHLIGHTER = 10
export const DEEP_RESEARCH = 40
export const FULL_SYNTHESIS = 30
export const RE_RUN = 10

/** Cost to create a new version of an idea (iteration) */
export const NEW_VERSION_CREDIT_COST = 10

/** Coin packages added on purchase (Starter / Builder / Operator) */
export const PLAN_COINS = {
  starter: 100,
  builder: 250,
  operator: 500,
} as const
