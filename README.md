# Coral CRM

Relationship intelligence for builders, powered by Coral-style cross-source SQL and an AI relationship agent.

Coral CRM turns scattered signals from Gmail, Calendar, Slack, LinkedIn, X/Twitter, and Notion into one relationship graph. The app does not stop at dashboards: it recommends who to contact today, explains why, drafts outreach, generates pre-meeting briefs, and exposes the SQL/capability proof judges can inspect.

## Why It Stands Out

- One SQL-shaped relationship graph instead of six disconnected API calls.
- Cross-source joins across email, meetings, chat, social, career signals, and notes.
- Coral capability cockpit for catalog discovery, parameter hints, cache/freshness, and ops proof.
- SQL Explorer with recipes for `contact_relationship_graph`, `coral.tables`, `coral.columns`, `coral.inputs`, and `coral.query_log`.
- Judge Demo mode that walks through the story in under two minutes.
- AI chat that understands network context and contact-specific questions.
- Exportable pre-meeting briefs for real workflow value.

## Demo Script

1. Open `http://localhost:3000`.
2. Show the cursor rain field on the landing page.
3. Open `/dashboard`.
4. Click `Judge Demo`.
5. Show the Agent Plan and Coral Capability Cockpit.
6. Ask the chat agent: `What Coral capabilities does this demo use?`
7. Open a contact, generate a pre-meeting brief, and export it.
8. Open `/explorer` and run a catalog query such as:

```sql
SELECT schema, table, sql_reference, source_type, freshness
FROM coral.tables
ORDER BY schema, table;
```

## Coral Capabilities Demonstrated

- SQL interface over multiple sources.
- Cross-source joins using `contact_relationship_graph`.
- Catalog discovery with `coral.tables` and `coral.columns`.
- Parameter hints with `coral.inputs`.
- Cache/freshness and query observability with `coral.query_log`.
- Source health cards showing freshness, cache state, row counts, and latency.
- Agent query replay showing how one ask becomes a Coral SQL path.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The project runs in demo mode without API keys. For live mode, set:

```env
DEMO_MODE=false
CORAL_API_URL=https://your-coral-instance.example
CORAL_API_KEY=coral_key_xxx
ANTHROPIC_API_KEY=sk-ant-xxx
```

## Key Routes

- `/` - Antigravity/Gentlerain-inspired landing page.
- `/dashboard` - relationship command center and judge demo mode.
- `/explorer` - Coral SQL recipes, schema catalog, and query sandbox.
- `/settings` - source connector configuration.

## Architecture

```text
User
  -> Next.js app
  -> API routes
  -> Coral-style SQL layer
  -> Gmail / Calendar / Slack / LinkedIn / X / Notion
  -> AI relationship agent
```

The core data product is the `contact_relationship_graph` materialized view defined in `sql/schema.sql`.

## Submission Docs

- [Coral judge setup](docs/CORAL_SETUP.md)
- [Submission package](docs/SUBMISSION.md)
