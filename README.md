# decixa-sdk

TypeScript SDK for [Decixa](https://decixa.ai) — The decision layer for AI Agents.

Discover, evaluate, and select from 20,000+ x402-enabled APIs programmatically.

> **v0.1.3**: aligned with Decixa Agent Hub API v1.1.0. New `recommendation_status` discriminated union, `min_similarity` parameter, intent-driven design. See [CHANGELOG.md](CHANGELOG.md) for breaking changes and migration guide.

## Install

```bash
npm install decixa-sdk
```

## Quick Start

```typescript
import { Decixa } from "decixa-sdk";

const decixa = new Decixa();

// Find the best API for an intent
const result = await decixa.resolve({
  intent: "extract social media posts by keyword",
});

if (result.recommendation_status === "resolved") {
  console.log(result.recommended.name);
  console.log(result.recommended.pricing.usdc_per_call);
} else {
  console.log("No match:", result.no_match_reason);
  console.log("Suggestions:", result.suggestions);
}
```

## API

### `new Decixa(config?)`

Create a client instance.

```typescript
const decixa = new Decixa({
  baseUrl: "https://api.decixa.ai", // default
  apiKey: "your-api-key",           // optional (not required today)
});
```

### `decixa.resolve(params)`

Get the top API recommendation for an intent. Returns a discriminated union:
- `recommendation_status: "resolved"` → `recommended` is non-null with up to 2 `alternatives`
- `recommendation_status: "no_match"` → `recommended` is `null`, `suggestions` contains below-threshold candidates

```typescript
const result = await decixa.resolve({
  intent: "find news articles about AI",   // required
  constraints: {
    latency: "low",                        // low | medium | high
    budget: 0.05,                          // max USDC per call
  },
  min_similarity: 0.5,                     // 0.2–0.9, default 0.5
});

if (result.recommendation_status === "resolved") {
  console.log(result.recommended.name);
  console.log(result.alternatives.length);
  console.log(result.is_fallback);  // true if constraints were relaxed
} else {
  console.log(result.no_match_reason);  // "low_semantic_similarity" | "insufficient_verified_pool_for_intent"
  for (const s of result.suggestions) {
    console.log(s.name, s.similarity);  // below-threshold candidates
  }
}
```

### `decixa.discover(params?)`

List APIs ranked by intent. Returns multiple candidates so you can choose.

```typescript
const result = await decixa.discover({
  intent: "web scraping",              // mapped to server's `task` query param
  tag: "Social Media",                 // filter by tag
  latency_tier: "low",
  execution_mode: "sync",              // sync | async
  pricing_model: "per_call",           // per_call | subscription | hybrid
  budget: 0.10,
  min_similarity: 0.3,                 // 0.2–0.9, default 0.3
  sort: "relevance",                   // relevance (default) | price_asc | price_desc | latency_asc | trust | calls (deprecated)
  limit: 20,
  offset: 0,
});

console.log(result.total);
console.log(result.search_mode);             // "vector" | "db_fallback"
console.log(result.min_similarity_applied);  // threshold actually used (null in db_fallback)

for (const api of result.apis) {
  console.log(api.name, api.similarity, api.trust.score);
  if (api.score_breakdown) {
    console.log("  score:", api.score_breakdown.final);
  }
}

if (result.no_match_reason) {
  console.log("No matches above threshold");
  console.log("Top below-threshold:", result.top_candidates_below_threshold);
}
```

### `decixa.detail(id)`

Get full metadata for a specific API.

```typescript
const api = await decixa.detail("550e8400-e29b-41d4-a716-446655440000");

api.verified_live                       // true if the API accepts x402 payments
api.trust_evidence.score                // 0-100 composite (prefer over legacy trust_score)
api.trust_evidence.uptime_7d            // 7-day uptime %
api.trust_evidence.p95_latency_ms       // p95 latency
api.trust_evidence.payment_req_parsed   // HTTP 402 probe success
api.agent_compatibility                 // latency, execution mode, deterministic
api.schema                              // input/output types, OpenAPI spec URL
```

## Use with AI Agents

```typescript
import { Decixa } from "decixa-sdk";

const decixa = new Decixa();

async function findAndCallApi(task: string) {
  const result = await decixa.resolve({ intent: task });

  if (result.recommendation_status === "no_match") {
    throw new Error(`No API found: ${result.no_match_reason}`);
  }

  const detail = await decixa.detail(result.recommended.id);

  const response = await fetch(detail.endpoint, {
    headers: { "X-402-Payment": "..." },
  });

  return response.json();
}
```

## Migration from v0.1.2

See [CHANGELOG.md](CHANGELOG.md) for the full migration guide.

| Change | Action |
|--------|--------|
| `recommendation_status` discriminator | Narrow with `if (r.recommendation_status === "resolved")` before accessing `recommended` |
| `capability` / `agent_ready` deprecated | Remove from your code (server silently ignores) |
| `task` → `intent` | Rename argument; `task` still works as alias |
| `ScoreBreakdown` field rename | `total → final`, `*_score → *` (debug=true callers) |
| Default sort `trust` → `relevance` | Pass `sort: "trust"` explicitly to preserve old behavior |

## Also Available

- **MCP Server**: `npx decixa-mcp` — use Decixa directly in Claude Code / Claude Desktop
- **REST API**: `https://api.decixa.ai/api/agent/resolve` — call directly via HTTP
- **OpenAPI spec**: `https://api.decixa.ai/api/agent/openapi.json`

## License

MIT
