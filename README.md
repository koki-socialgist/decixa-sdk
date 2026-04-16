# decixa-sdk

TypeScript SDK for [Decixa](https://decixa.ai) — The decision layer for AI Agents.

Discover, evaluate, and select from 20,000+ x402-enabled APIs programmatically.

## Install

```bash
npm install decixa-sdk
```

## Quick Start

```typescript
import { Decixa } from "decixa-sdk";

const decixa = new Decixa();

// Find the best API for a task
const result = await decixa.resolve({
  capability: "Extract",
  intent: "extract social media posts by keyword",
});

console.log(result.recommended);
// { name: "Neynar", endpoint: "https://...", pricing: { model: "per_call", usdc_per_call: 0.01 }, ... }
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

Get the top API recommendation for a capability + intent. Returns a ranked recommendation with up to 2 alternatives.

```typescript
const result = await decixa.resolve({
  capability: "Search",     // required: Search | Extract | Transform | Analyze | Generate | Modify | Communicate | Transact | Store
  intent: "find news articles about AI",
  constraints: {
    latency: "low",          // low | medium | high
    budget: 0.05,            // max USDC per call
    agent_ready: true,       // only verified APIs
  },
});

result.recommended   // top-ranked API or null
result.alternatives  // up to 2 more options
result.is_fallback   // true if constraints were relaxed
```

### `decixa.discover(params?)`

Browse and search APIs with filters. Supports vector search (semantic matching).

```typescript
const result = await decixa.discover({
  task: "web scraping",          // free-text search
  capability: "Extract",         // filter by capability
  tag: "Social Media",           // filter by tag
  latency_tier: "low",
  pricing_model: "per_call",
  budget: 0.10,
  sort: "trust",                 // trust | price_asc | price_desc
  limit: 20,
  offset: 0,
});

result.total  // total matching APIs
result.apis   // array of API summaries with trust scores
result.next   // URL for next page (or null)
```

### `decixa.detail(id)`

Get full metadata for a specific API.

```typescript
const api = await decixa.detail("550e8400-e29b-41d4-a716-446655440000");

api.trust_evidence.uptime_7d     // 7-day uptime %
api.trust_evidence.p95_latency_ms // p95 latency
api.agent_compatibility           // latency, execution mode, deterministic
api.schema                        // input/output types, OpenAPI spec URL
```

## Use with AI Agents

```typescript
import { Decixa } from "decixa-sdk";

const decixa = new Decixa();

async function findAndCallApi(task: string) {
  // 1. Resolve the best API
  const { recommended } = await decixa.resolve({
    capability: "Extract",
    intent: task,
  });

  if (!recommended) throw new Error("No API found");

  // 2. Get full details
  const detail = await decixa.detail(recommended.id);

  // 3. Call the API (x402 payment handled by your agent)
  const response = await fetch(detail.endpoint, {
    headers: { "X-402-Payment": "..." },
  });

  return response.json();
}
```

## Also Available

- **MCP Server**: `npx decixa-mcp` — use Decixa directly in Claude Code
- **REST API**: `https://api.decixa.ai/api/agent/resolve` — call directly via HTTP

## License

MIT
