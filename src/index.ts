import { HttpClient } from "./client.js";
import type {
  DecixaConfig,
  ResolveParams,
  ResolveResponse,
  DiscoverParams,
  DiscoverResponse,
  ApiDetail,
} from "./types.js";

export class Decixa {
  private http: HttpClient;

  constructor(config: DecixaConfig = {}) {
    this.http = new HttpClient(config);
  }

  /**
   * Get the top API recommendation for an intent.
   *
   * Use the `recommendation_status` discriminator to narrow the result type.
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
  async resolve(params: ResolveParams): Promise<ResolveResponse> {
    return this.http.post<ResolveResponse>("/api/agent/resolve", params);
  }

  /**
   * List APIs ranked by intent. Returns multiple candidates so the agent can choose.
   * Use this when you want options — use `resolve()` for a single recommendation.
   *
   * @example
   * ```ts
   * const result = await decixa.discover({
   *   intent: "web scraping",
   *   sort: "relevance",  // default
   *   limit: 10,
   * });
   * for (const api of result.apis) {
   *   console.log(api.name, api.similarity, api.trust.score);
   * }
   * if (result.no_match_reason) {
   *   console.log("No matches above threshold:", result.top_candidates_below_threshold);
   * }
   * ```
   */
  async discover(params: DiscoverParams = {}): Promise<DiscoverResponse> {
    const query: Record<string, string | number | boolean | undefined> = {};
    // intent / task: intent 優先、なければ task fallback (deprecated alias)
    const taskValue = params.intent ?? params.task;
    if (taskValue) query.task = taskValue;
    if (params.tag) query.tag = params.tag;
    // capability / agent_ready は @deprecated。query に含めない (server で silently ignore)
    if (params.latency_tier) query.latency_tier = params.latency_tier;
    if (params.execution_mode) query.execution_mode = params.execution_mode;
    if (params.pricing_model) query.pricing_model = params.pricing_model;
    if (params.budget !== undefined) query.budget = params.budget;
    // v0.1.4 (D-084): new filters
    if (params.cost_max_per_call_usdc !== undefined) query.cost_max_per_call_usdc = params.cost_max_per_call_usdc;
    if (params.latency_p95_max_ms !== undefined) query.latency_p95_max_ms = params.latency_p95_max_ms;
    if (params.min_similarity !== undefined) query.min_similarity = params.min_similarity;
    if (params.sort) query.sort = params.sort;
    if (params.limit !== undefined) query.limit = params.limit;
    if (params.offset !== undefined) query.offset = params.offset;
    return this.http.get<DiscoverResponse>("/api/agent/discover", query);
  }

  /**
   * Get full metadata for a specific API by ID.
   *
   * @example
   * ```ts
   * const api = await decixa.detail("550e8400-e29b-41d4-a716-446655440000");
   * console.log(api.trust_evidence.uptime_7d);
   * ```
   */
  async detail(id: string): Promise<ApiDetail> {
    return this.http.get<ApiDetail>(`/api/agent/detail/${id}`);
  }
}

// Re-export types
export type {
  DecixaConfig,
  Capability,
  LatencyTier,
  PricingModel,
  SortOption,
  SearchMode,
  RecommendationStatus,
  NoMatchReason,
  Pricing,
  TrustEvidence,
  Provider,
  ScoreBreakdown,
  ResolveParams,
  ResolveResponse,
  ResolveResponseResolved,
  ResolveResponseNoMatch,
  ResolvedApi,
  Suggestion,
  DiscoverParams,
  DiscoverResponse,
  ApiSummary,
  ApiDetail,
} from "./types.js";
