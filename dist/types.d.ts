export type Capability = "Search" | "Extract" | "Transform" | "Analyze" | "Generate" | "Modify" | "Communicate" | "Transact" | "Store";
export type LatencyTier = "low" | "medium" | "high";
export type PricingModel = "per_call" | "subscription" | "hybrid" | "unknown";
export type SortOption = "trust" | "calls" | "price_asc" | "price_desc";
export interface Pricing {
    model: string;
    usdc_per_call: number | null;
}
export interface TrustEvidence {
    score: number | null;
    uptime_7d: number | null;
    p95_latency_ms: number | null;
    payment_req_parsed: boolean | null;
    last_checked: string | null;
    last_probed_at: string | null;
}
export interface Provider {
    name: string;
    website: string | null;
}
export interface ResolveParams {
    capability: Capability;
    intent?: string;
    constraints?: {
        latency?: LatencyTier;
        budget?: number;
        agent_ready?: boolean;
    };
    debug?: boolean;
}
export interface ScoreBreakdown {
    total: number;
    latency_score: number;
    price_score: number;
    tag_score: number;
    tag_boost_score: number;
    tiebreak_score: number;
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
    trust_score: null;
    _score?: ScoreBreakdown;
}
export interface ResolveResponse {
    recommended: ResolvedApi | null;
    alternatives: ResolvedApi[];
    is_fallback: boolean;
    fallback_reason: string | null;
    relaxed_constraints: Record<string, string> | null;
    strict_match_count: number;
    fallback_match_count: number;
}
export interface DiscoverParams {
    task?: string;
    capability?: Capability;
    tag?: string;
    agent_ready?: boolean;
    latency_tier?: LatencyTier;
    execution_mode?: "sync" | "async";
    pricing_model?: PricingModel;
    budget?: number;
    sort?: SortOption;
    limit?: number;
    offset?: number;
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
    trust_score: number;
    trust: TrustEvidence;
    provider: Provider | null;
    detail_url: string;
}
export interface DiscoverResponse {
    total: number;
    limit: number;
    offset: number;
    next: string | null;
    prev: string | null;
    apis: ApiSummary[];
    search_mode?: string;
}
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
    trust_score: number;
    trust_evidence: TrustEvidence;
    metadata_source: string | null;
    provider: Provider | null;
    decixa_url: string;
    discover_url: string;
}
export interface CapabilityInfo {
    name: Capability;
    description: string;
    tags?: string[];
}
export interface DecixaConfig {
    baseUrl?: string;
    apiKey?: string;
}
//# sourceMappingURL=types.d.ts.map