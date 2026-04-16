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
   * Get the top API recommendation for a given capability and intent.
   *
   * @example
   * ```ts
   * const result = await decixa.resolve({
   *   capability: "Extract",
   *   intent: "extract social media posts by keyword",
   * });
   * console.log(result.recommended?.name);
   * ```
   */
  async resolve(params: ResolveParams): Promise<ResolveResponse> {
    return this.http.post<ResolveResponse>("/api/agent/resolve", params);
  }

  /**
   * Search and browse APIs with filters and pagination.
   *
   * @example
   * ```ts
   * const result = await decixa.discover({
   *   task: "web scraping",
   *   sort: "trust",
   *   limit: 10,
   * });
   * for (const api of result.apis) {
   *   console.log(api.name, api.trust_score);
   * }
   * ```
   */
  async discover(params: DiscoverParams = {}): Promise<DiscoverResponse> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params.task) query.task = params.task;
    if (params.capability) query.capability = params.capability;
    if (params.tag) query.tag = params.tag;
    if (params.agent_ready !== undefined)
      query.agent_ready = String(params.agent_ready);
    if (params.latency_tier) query.latency_tier = params.latency_tier;
    if (params.execution_mode) query.execution_mode = params.execution_mode;
    if (params.pricing_model) query.pricing_model = params.pricing_model;
    if (params.budget !== undefined) query.budget = params.budget;
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
  Pricing,
  TrustEvidence,
  Provider,
  ResolveParams,
  ResolveResponse,
  ResolvedApi,
  ScoreBreakdown,
  DiscoverParams,
  DiscoverResponse,
  ApiSummary,
  ApiDetail,
} from "./types.js";
