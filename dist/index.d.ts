import type { DecixaConfig, ResolveParams, ResolveResponse, DiscoverParams, DiscoverResponse, ApiDetail } from "./types.js";
export declare class Decixa {
    private http;
    constructor(config?: DecixaConfig);
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
    resolve(params: ResolveParams): Promise<ResolveResponse>;
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
    discover(params?: DiscoverParams): Promise<DiscoverResponse>;
    /**
     * Get full metadata for a specific API by ID.
     *
     * @example
     * ```ts
     * const api = await decixa.detail("550e8400-e29b-41d4-a716-446655440000");
     * console.log(api.trust_evidence.uptime_7d);
     * ```
     */
    detail(id: string): Promise<ApiDetail>;
}
export type { DecixaConfig, Capability, LatencyTier, PricingModel, SortOption, SearchMode, RecommendationStatus, NoMatchReason, Pricing, TrustEvidence, Provider, ScoreBreakdown, ResolveParams, ResolveResponse, ResolveResponseResolved, ResolveResponseNoMatch, ResolvedApi, Suggestion, DiscoverParams, DiscoverResponse, ApiSummary, ApiDetail, } from "./types.js";
//# sourceMappingURL=index.d.ts.map