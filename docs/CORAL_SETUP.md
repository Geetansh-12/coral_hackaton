# Coral CRM Judge Setup

This project is designed to show Coral as the agent data layer for a relationship-intelligence workflow.

## Demo Flow

1. Open `http://localhost:3000`.
2. Move the cursor over the landing hero to show the interactive rain-field UI.
3. Open the dashboard and click `Judge Demo`.
4. Show `Agent plan`, then `Coral capability cockpit`.
5. Open `SQL Explorer` and run:

```sql
SELECT schema, table, sql_reference, source_type, freshness
FROM coral.tables
ORDER BY schema, table;
```

6. Ask the chat agent:

```text
What Coral capabilities does this demo use?
```

7. Open a contact, generate a pre-meeting brief, then export the brief.

## Coral Capabilities Demonstrated

- One SQL interface over multiple sources.
- Cross-source joins across Gmail, Calendar, Slack, LinkedIn, X, and Notion.
- Catalog discovery using `coral.tables` and `coral.columns`.
- Parameter hints using `coral.inputs`.
- Cache/freshness observability through `coral.query_log`.
- Centralized auth/retries/pagination/rate-limit story for agent workloads.

## Production Wiring

Set environment variables in `.env.local`:

```env
DEMO_MODE=false
CORAL_API_URL=https://your-coral-instance.example
CORAL_API_KEY=coral_key_xxx
ANTHROPIC_API_KEY=sk-ant-xxx
```

Run:

```bash
npm install
npm run dev
```

## Screenshot Checklist

Capture these screens for submission:

- Landing hero with cursor rain effect.
- Dashboard with `Judge Demo` overlay open.
- Coral capability cockpit.
- Source freshness cards.
- SQL Explorer catalog query result.
- Contact detail panel with exported AI brief.

## Judge Pitch

Coral CRM is not a contacts app. It is an agentic relationship workflow where Coral turns scattered relationship surfaces into one SQL graph. The AI can discover schemas, run safe parameterized queries, use cached materialized views, and produce concrete relationship actions from real cross-source context.
