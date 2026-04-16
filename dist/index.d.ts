import type { DecixaConfig, ResolveParams, ResolveResponse, DiscoverParams, DiscoverResponse, ApiDetail } from "./types.js";
export declare class Decixa {
    private http;
    constructor(config?: DecixaConfig);
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
    resolve(params: ResolveParams): Promise<ResolveResponse>;
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
export type { DecixaConfig, Capability, LatencyTier, PricingModel, SortOption, Pricing, TrustEvidence, Provider, ResolveParams, ResolveResponse, ResolvedApi, ScoreBreakdown, DiscoverParams, DiscoverResponse, ApiSummary, ApiDetail, } from "./types.js";
//# sourceMappingURL=index.d.ts.map