// ── Shared ──

export type Capability =
  | "Search"
  | "Extract"
  | "Transform"
  | "Analyze"
  | "Generate"
  | "Modify"
  | "Communicate"
  | "Transact"
  | "Store";

export type LatencyTier = "low" | "medium" | "high";
export type PricingModel = "per_call" | "subscription" | "hybrid" | "unknown";

/**
 * Sort preset for `discover()`.
 *
 * - `relevance` (default in v0.1.3): Phase 3 normalized score (vector + latency + price + tiebreak).
 * - `price_asc` / `price_desc` / `latency_asc` / `trust`: primary sort with similarity DESC tie-breaker.
 * - `calls`: @deprecated, will be removed in Phase 4. Use `trust` or `relevance` instead.
 */
export type SortOption =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "latency_asc"
  | "trust"
  | "calls";

export type SearchMode = "vector" | "db_fallback";

export type RecommendationStatus = "resolved" | "no_match";

export type NoMatchReason =
  | "low_semantic_similarity"
  | "insufficient_verified_pool_for_intent";

export interface Pricing {
  model: string;
  usdc_per_call: number | null;
}

export interface TrustEvidence {
  /** Composite trust score (0-100). Nullable when not yet calculated. Prefer this over legacy `trust_score`. */
  score: number | null;
  /** Uptime ratio over 7 days (0-100). */
  uptime_7d: number | null;
  p95_latency_ms: number | null;
  /** HTTP 402 probe success. */
  payment_req_parsed: boolean | null;
  last_checked: string | null;
  last_probed_at: string | null;
}

export interface Provider {
  name: string;
  website: string | null;
}

/**
 * Phase 3 normalized score breakdown. final = vector + latency + price + tiebreak.
 * Each component is `W_x * normalized_x` and lies in `[0, 1]`.
 */
export interface ScoreBreakdown {
  /** Sum of all components, range [0, 1]. */
  final: number;
  /** W_VECTOR (0.70) * cosine similarity. */
  vector: number;
  /** W_LATENCY (0.05) * latency_norm. */
  latency: number;
  /** W_PRICE (0.05) * price_norm. */
  price: number;
  /** W_TIEBREAK (0.20) * keyword similarity. */
  tiebreak: number;
}

// ── resolve ──

export interface ResolveParams {
  /** Natural-language intent. Required in v0.1.3. */
  intent: string;
  constraints?: {
    latency?: LatencyTier;
    /**
     * @deprecated v0.1.4: Prefer `cost_max_per_call_usdc`. Kept for backward compatibility.
     * Invalid values are silently ignored. When both `budget` and `cost_max_per_call_usdc`
     * are set, the stricter (smaller) value applies (e.g., budget=0.05 + cost_max_per_call_usdc=0.01 → 0.01 applies).
     */
    budget?: number;
    /**
     * v0.1.4 (D-084): Maximum cost per call in USDC.
     * Invalid values (negative, NaN) return HTTP 400.
     * When both `budget` and this are set, the stricter (smaller) value applies.
     */
    cost_max_per_call_usdc?: number;
    /**
     * v0.1.4 (D-084): Maximum measured p95 latency in milliseconds.
     * Invalid values (≤0, NaN) return HTTP 400.
     * APIs with no measured `p95_latency_ms` are excluded from results when this filter is set.
     */
    latency_p95_max_ms?: number;
    /**
     * @deprecated v0.1.3: Server silently ignores this (D-059 v4 c3.5). Will be removed in v1.0.0.
     * agent_ready data quality issue (97.3% of verified pool defaults to false). See D-068.
     */
    agent_ready?: boolean;
  };
  /**
   * Similarity threshold for vector search. Range 0.2–0.9. Default 0.5.
   * Out-of-range values throw 400 from the server.
   */
  min_similarity?: number;
  /**
   * @deprecated v0.1.3: Server silently ignores this (D-059 Phase 3a). Will be removed in v1.0.0.
   * Capability filtering is no longer needed; intent text + Phase 3 vector ranking handles matching.
   */
  capability?: Capability;
  /** Include `_score` breakdown on `recommended` and `alternatives`. */
  debug?: boolean;
}

export interface ResolvedApi {
  id: string;
  name: string;
  endpoint: string | null;
  capability: string | null;
  tags: string[];
  pricing: Pricing;
  latency_tier: string | null;
  agent_ready: boolean;
  detail_url: string;
  ranking_basis: string;
  trust_score: number | null;
  /** Present when `debug=true` in request. */
  _score?: ScoreBreakdown;
}

/** Below-threshold candidate returned by Resolve in no_match mode. Slim shape (compared to ApiSummary). */
export interface Suggestion {
  id: string;
  name: string;
  capability: string | null;
  similarity: number;
  why_suggested: "top_vector_match_below_threshold";
}

/** Resolve response — single recommendation found above similarity threshold. */
export interface ResolveResponseResolved {
  recommendation_status: "resolved";
  recommended: ResolvedApi;
  alternatives: ResolvedApi[];
  search_mode: SearchMode;
  is_fallback: boolean;
  fallback_reason: string | null;
  relaxed_constraints: Record<string, string> | null;
  strict_match_count: number;
  fallback_match_count: number;
}

/** Resolve response — no candidate cleared the similarity threshold. */
export interface ResolveResponseNoMatch {
  recommendation_status: "no_match";
  recommended: null;
  alternatives: never[];
  no_match_reason: NoMatchReason;
  suggestions: Suggestion[];
  search_mode: SearchMode;
  is_fallback: boolean;
  fallback_reason: string | null;
  relaxed_constraints: Record<string, string> | null;
  strict_match_count: number;
  fallback_match_count: number;
}

/**
 * Discriminated union — narrow by `recommendation_status` before accessing `recommended`.
 *
 * Because of discriminated union, you must narrow by `recommendation_status` first;
 * direct access to `result.recommended` will be typed as `ResolvedApi | null`, but the
 * compiler will not let you assume `recommended` is non-null without narrowing.
 *
 * @example
 * ```ts
 * const result = await decixa.resolve({ intent: "scrape reddit" });
 * if (result.recommendation_status === "resolved") {
 *   console.log(result.recommended.name);  // typed as ResolvedApi
 * } else {
 *   console.log(result.no_match_reason);   // typed as NoMatchReason
 *   console.log(result.suggestions.length);
 * }
 * ```
 */
export type ResolveResponse = ResolveResponseResolved | ResolveResponseNoMatch;

// ── discover ──

export interface DiscoverParams {
  /**
   * Natural-language intent. Maps to the server's `task` query parameter.
   * Recommended primary parameter in v0.1.3.
   */
  intent?: string;
  /**
   * @deprecated v0.1.3: alias for `intent`. Use `intent` instead.
   * Kept for SDK compatibility; the MCP server (decixa-mcp v0.1.7) removed this entirely.
   */
  task?: string;
  tag?: string;
  /**
   * @deprecated v0.1.3: Server silently ignores this (D-059 v4 c3.5). Will be removed in v1.0.0.
   */
  agent_ready?: boolean;
  latency_tier?: LatencyTier;
  execution_mode?: "sync" | "async";
  pricing_model?: PricingModel;
  /**
   * @deprecated v0.1.4: Prefer `cost_max_per_call_usdc`. Kept for backward compatibility.
   * Invalid values are silently ignored. When both `budget` and `cost_max_per_call_usdc`
   * are set, the stricter (smaller) value applies.
   */
  budget?: number;
  /**
   * v0.1.4 (D-084): Maximum cost per call in USDC.
   * Invalid values (negative, NaN) return HTTP 400.
   * When both `budget` and this are set, the stricter (smaller) value applies.
   */
  cost_max_per_call_usdc?: number;
  /**
   * v0.1.4 (D-084): Maximum measured p95 latency in milliseconds.
   * Invalid values (≤0, NaN) return HTTP 400.
   * APIs with no measured `p95_latency_ms` are excluded from results when this filter is set.
   */
  latency_p95_max_ms?: number;
  /**
   * Similarity threshold for vector search. Range 0.2–0.9. Default 0.3.
   * Out-of-range values throw 400 from the server.
   */
  min_similarity?: number;
  /**
   * Sort preset. Default `relevance` (changed from `trust` in v0.1.3).
   */
  sort?: SortOption;
  limit?: number;
  offset?: number;
  /**
   * @deprecated v0.1.3: Server silently ignores this (D-059 Phase 3a). Will be removed in v1.0.0.
   */
  capability?: Capability;
}

export interface ApiSummary {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  pricing: Pricing;
  capability: string | null;
  tags: string[];
  agent_ready: boolean;
  latency_tier: string | null;
  execution_mode: string | null;
  data_mode: string | null;
  deterministic: boolean | null;
  input_type: string[];
  output_type: string[];
  use_cases: string[];
  spec_url: string | null;
  /** Legacy composite score. Prefer `trust.score` for new clients. */
  trust_score: number;
  trust: TrustEvidence;
  provider: Provider | null;
  detail_url: string;
  /** Vector cosine similarity. Present in vector mode only (`null` in db_fallback). */
  similarity: number | null;
  /** Phase 3 normalized score breakdown. Present when `sort=relevance` (`null` otherwise). */
  score_breakdown: ScoreBreakdown | null;
}

export interface DiscoverResponse {
  total: number;
  limit: number;
  offset: number;
  next: string | null;
  prev: string | null;
  apis: ApiSummary[];
  search_mode: SearchMode;
  /** Threshold actually applied. Null in db_fallback mode. */
  min_similarity_applied: number | null;
  /** Set when no candidate cleared the threshold (vector mode only). Null otherwise. */
  no_match_reason: NoMatchReason | null;
  /** Up to 2 candidates that fell below `min_similarity`. Empty array when above threshold or db_fallback. */
  top_candidates_below_threshold: ApiSummary[];
}

// ── detail ──

export interface ApiDetail {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  /**
   * Whether this API is verified to accept x402 payments
   * (i.e., payment_req_parsed === true).
   * Convenience flag derived from trust_evidence.payment_req_parsed.
   */
  verified_live: boolean;
  pricing: Pricing;
  capability: string | null;
  tags: string[];
  agent_compatibility: {
    agent_ready: boolean;
    latency_tier: string | null;
    execution_mode: string | null;
    data_mode: string | null;
    deterministic: boolean | null;
  };
  schema: {
    input_type: string[];
    output_type: string[];
    spec_url: string | null;
  };
  use_cases: string[];
  /** Legacy composite score. Prefer `trust_evidence.score` for new clients. */
  trust_score: number;
  trust_evidence: TrustEvidence;
  metadata_source: string | null;
  provider: Provider | null;
  decixa_url: string;
  discover_url: string;
}

// ── config ──

export interface DecixaConfig {
  baseUrl?: string;
  apiKey?: string;
}
