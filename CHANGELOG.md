# Changelog

## v0.1.3 (2026-04-25)

Phase 3b step 3 — types aligned with Decixa Agent Hub API v1.1.0.

### Breaking
- **`ResolveResponse` is now a discriminated union** on `recommendation_status` (`"resolved" | "no_match"`). You must narrow before accessing `recommended` or `no_match_reason`. See migration guide below.
- **`ScoreBreakdown` field renamed** (debug=true callers only):
  - `total / latency_score / price_score / tag_score / tag_boost_score / tiebreak_score` → `final / vector / latency / price / tiebreak`
  - `tag_score` / `tag_boost_score` removed (D-059 c3 撤廃).
- **Default `sort` for `discover()` changed**: `trust` → `relevance`. Callers that relied on default ordering now see Phase 3 ranking. To preserve old behavior, pass `sort: "trust"` explicitly.
- **`SortOption` enum updated**: added `relevance` (default), `latency_asc`. `calls` is deprecated.
- **`ResolveParams.intent` is now required** (was optional). The previous `capability`-required design is reversed; intent is the primary signal in v0.1.3.

### Deprecated (will be removed in v1.0.0)
- `ResolveParams.capability` — server silently ignores (D-059 v4 c3.5). Remove from your code.
- `ResolveParams.constraints.agent_ready` — same.
- `DiscoverParams.capability` / `DiscoverParams.agent_ready` — same.
- `DiscoverParams.task` — alias for `intent`. Use `intent` instead.
  - **Note**: `task` is kept as an alias of `intent` for SDK compatibility. The MCP server (`decixa-mcp` v0.1.7) removed `task` from the tool schema entirely; the SDK preserves it because human developers may have hand-written `task` in their code. Use `intent` for new code.

### Added
- `min_similarity` parameter on `ResolveParams` (default 0.5) and `DiscoverParams` (default 0.3). Range 0.2–0.9. Out-of-range throws 400 from the server.
- `recommendation_status` field on `ResolveResponse`. Use for type narrowing.
- New types: `SearchMode`, `RecommendationStatus`, `NoMatchReason`, `ResolveResponseResolved`, `ResolveResponseNoMatch`, `Suggestion`.
- `ApiSummary.similarity` (vector cosine similarity, vector mode only) + `ApiSummary.score_breakdown` (sort=relevance only).
- `DiscoverResponse.min_similarity_applied` / `no_match_reason` / `top_candidates_below_threshold`.

### Removed
- `CapabilityInfo` type (was unused; no SDK method consumed it).

### Fixed
- Version drift: `client.ts` `VERSION` constant (was `0.1.0`), User-Agent header now reports `decixa-sdk/0.1.3`.

### Migration guide

#### 1. Discriminated union narrowing (required)

**Old (v0.1.2)**:
```ts
const r = await decixa.resolve({ intent: "...", capability: "Search" });
if (r.recommended) {
  console.log(r.recommended.name);
}
```

**New (v0.1.3)**:
```ts
const r = await decixa.resolve({ intent: "..." });
if (r.recommendation_status === "resolved") {
  console.log(r.recommended.name);  // ResolvedApi 型
} else {
  console.log(r.no_match_reason, r.suggestions);
}
```

Because of the discriminated union, you must narrow by `recommendation_status` before accessing `recommended` — otherwise TypeScript will not let you assume non-null.

#### 2. Drop `capability` / `agent_ready`

```diff
- await decixa.resolve({ intent: "...", capability: "Search", constraints: { agent_ready: true } });
+ await decixa.resolve({ intent: "..." });
```

The TypeScript types will give you `@deprecated` warnings in IDEs. The server already silently ignores these arguments.

#### 3. ScoreBreakdown field rename (debug=true callers)

```diff
  const r = await decixa.resolve({ intent: "...", debug: true });
  if (r.recommendation_status === "resolved") {
-   console.log(r.recommended._score?.total);
+   console.log(r.recommended._score?.final);
-   console.log(r.recommended._score?.tiebreak_score);
+   console.log(r.recommended._score?.tiebreak);
  }
```

#### 4. `discover` task → intent

```diff
- await decixa.discover({ task: "..." });
+ await decixa.discover({ intent: "..." });
```

The `task` alias still works (kept for compatibility) but is `@deprecated`.

#### 5. Default sort changed

```diff
  // To preserve old behavior:
- await decixa.discover({ /* ... */ });
+ await decixa.discover({ sort: "trust", /* ... */ });
```

If you depended on `trust` ordering by default, pass `sort: "trust"` explicitly.

---

## v0.1.2 (2026-04-15)
- Added `verified_live` flag to `ApiDetail` (D-048 sync).

## v0.1.1
- Auto-attach `x-decixa-source: internal` header when `DECIXA_INTERNAL=true`.

## v0.1.0
- Initial release: `Decixa` class with `resolve` / `discover` / `detail` methods.
