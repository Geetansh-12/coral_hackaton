# Submission Package

## One-Liner

Coral CRM is an agentic relationship command center where Coral turns scattered personal/professional data into one SQL graph, and an AI agent turns that graph into the next best relationship action.

## 30-Second Pitch

Most agents are bad at relationship work because the data is scattered across email, calendar, Slack, LinkedIn, X, and notes. Coral CRM uses a Coral-style SQL layer to join those sources into `contact_relationship_graph`. From there, the app recommends who to reach out to, explains why, drafts the message, generates pre-meeting briefs, and exposes the SQL/caching/catalog proof inside the product.

## What To Show Judges

1. `Judge Demo` on `/dashboard`.
2. Coral Capability Cockpit.
3. Source freshness cards.
4. Coral vs normal MCP comparison.
5. SQL Explorer catalog and query-log recipes.
6. Contact detail brief export.
7. Chat prompt: `What Coral capabilities does this demo use?`

## Differentiators

- Not a generic CRM: the primary interface is an action queue.
- Not a generic AI wrapper: the AI is grounded in relationship graph context.
- Not vague Coral usage: the app explicitly shows cross-source joins, catalog discovery, parameter hints, cache/freshness, and source health.
- Demo-safe: mock Coral gateway returns deterministic rows for judge queries.

## Known Constraints

- Demo mode uses realistic mock data so judges can test without credentials.
- Live Coral integration is represented by the `lib/coral.ts` boundary, SQL schema, and `/api/query` gateway.
- Production deployment would swap the mock evaluator for real Coral SQL execution.

## Final Demo Prompt Set

```text
What Coral capabilities does this demo use?
```

```text
luis gracia
```

```text
Write a follow-up for Rachel Kim
```

```sql
SELECT query_name, sources_joined, cache_hit_rate, avg_ms, last_cache_refresh
FROM coral.query_log
ORDER BY avg_ms DESC;
```
