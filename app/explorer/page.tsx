'use client'
// ============================================================
// CORAL SQL EXPLORER
// Interactive query viewer — shows the SQL powering the CRM
// Lets judges see the actual Coral cross-source queries
// ============================================================

import { useState } from 'react'
import Link from 'next/link'

interface QueryExample {
  id: string
  title: string
  description: string
  category: 'cross-source' | 'health' | 'signals' | 'digest' | 'catalog' | 'ops'
  sql: string
  coralFeatures: string[]
  resultPreview: Record<string, string | number | boolean>[]
}

const queries: QueryExample[] = [
  {
    id: 'q1',
    title: 'Contact Relationship Graph',
    description: 'The core materialized view — joins Gmail, Calendar, Slack, Twitter, LinkedIn, and Notion into one row per contact with a health score.',
    category: 'cross-source',
    sql: `-- THE HEART OF CORAL CRM
-- Cross-source JOIN across 6 platforms
SELECT
  c.name, c.email, c.company, c.role,
  c.relationship, c.tags,
  
  -- Last touch across ALL channels
  GREATEST(
    e.last_email_received,
    cal.last_meeting,
    s.last_slack,
    t.last_twitter_interaction,
    l.last_linkedin_signal
  ) AS last_contact_at,
  
  -- Relationship health score (0-100)
  LEAST(100, GREATEST(0,
    60 * GREATEST(0, 1 - (days_since / 180.0)) +
    40 * LEAST(1, total_touchpoints / 50.0)
  )) AS health_score

FROM notion_contacts c
LEFT JOIN gmail_stats e       ON c.email = e.email
LEFT JOIN calendar_stats cal  ON c.email = cal.email
LEFT JOIN slack_stats s       ON c.email = s.email
LEFT JOIN twitter_stats t     ON c.email = t.email
LEFT JOIN linkedin_stats l    ON c.email = l.email;`,
    coralFeatures: ['Cross-source JOIN', 'SQL Interface', 'Materialized View', 'Caching'],
    resultPreview: [
      { name: 'Sarah Chen', company: 'Stripe', health: 92, last_contact: '3 days ago', channels: 5 },
      { name: 'Priya Patel', company: 'Anthropic', health: 95, last_contact: '2 days ago', channels: 5 },
      { name: 'Sam Patel', company: 'Railway', health: 90, last_contact: '4 days ago', channels: 4 },
    ],
  },
  {
    id: 'q2',
    title: 'Fading Relationships',
    description: 'Find contacts going cold — no touchpoint in 60+ days. Powers the "reach out today" daily digest.',
    category: 'health',
    sql: `-- WHO HAVEN'T I TALKED TO IN A WHILE?
-- Coral cross-source query across all channels
SELECT
  name, email, company,
  days_since_contact,
  health_score,
  last_contact_at,
  -- Show which channel was last used
  CASE
    WHEN last_email_received = last_contact_at THEN 'email'
    WHEN last_meeting = last_contact_at THEN 'meeting'
    WHEN last_slack = last_contact_at THEN 'slack'
    WHEN last_twitter_interaction = last_contact_at THEN 'twitter'
    WHEN last_linkedin_signal = last_contact_at THEN 'linkedin'
  END AS last_channel
FROM contact_relationship_graph
WHERE days_since_contact > 60
  AND relationship IN ('close', 'professional')
ORDER BY health_score DESC, days_since_contact DESC
LIMIT 10;`,
    coralFeatures: ['Cross-source JOIN', 'SQL Interface', 'Cached View'],
    resultPreview: [
      { name: 'Rachel Kim', company: 'a16z', days: 89, score: 32, last_channel: 'email' },
      { name: 'David Park', company: 'Notion', days: 65, score: 38, last_channel: 'slack' },
      { name: 'Dan Abramov', company: 'Bluesky', days: 75, score: 28, last_channel: 'twitter' },
    ],
  },
  {
    id: 'q3',
    title: 'Network Health Overview',
    description: 'Dashboard summary — strong, fading, dormant counts with average health score across all contacts.',
    category: 'health',
    sql: `-- NETWORK HEALTH DASHBOARD STATS
-- Aggregated from the cached materialized view
SELECT
  COUNT(*) AS total_contacts,
  COUNT(*) FILTER (WHERE health_score >= 70) AS strong,
  COUNT(*) FILTER (
    WHERE health_score >= 40 AND health_score < 70
  ) AS fading,
  COUNT(*) FILTER (WHERE health_score < 40) AS dormant,
  ROUND(AVG(health_score)::numeric, 1) AS avg_score
FROM contact_relationship_graph;`,
    coralFeatures: ['SQL Interface', 'Aggregation', 'Cached View'],
    resultPreview: [
      { total: 34, strong: 12, fading: 12, dormant: 10, avg_score: 55.2 },
    ],
  },
  {
    id: 'q4',
    title: 'Pre-Meeting Brief — Full Context',
    description: 'Before a meeting, pull EVERYTHING about a contact: recent emails, upcoming events, LinkedIn signals, Slack DMs.',
    category: 'cross-source',
    sql: `-- PRE-MEETING BRIEF: cross-source context pull
-- Uses Coral JOINs across 4 tables simultaneously
SELECT
  crg.name, crg.company, crg.role,
  crg.health_score, crg.notes,
  
  -- Recent emails (Gmail source)
  gt.subject AS last_email_subject,
  gt.snippet AS last_email_preview,
  gt.sent_at AS last_email_date,
  
  -- Next meeting (Calendar source)
  ce.title AS upcoming_meeting,
  ce.starts_at AS meeting_time,
  ce.video_link,
  
  -- Career signals (LinkedIn source)
  la.detail AS linkedin_update,
  la.event_type AS signal_type

FROM contact_relationship_graph crg
LEFT JOIN gmail_threads gt
  ON crg.email = gt.from_email
LEFT JOIN calendar_events ce
  ON ce.attendees @> jsonb_build_array(
    jsonb_build_object('email', crg.email)
  )
  AND ce.starts_at > NOW()
LEFT JOIN linkedin_activity la
  ON crg.email = la.contact_email
WHERE crg.email = $1
ORDER BY gt.sent_at DESC, ce.starts_at ASC
LIMIT 5;`,
    coralFeatures: ['Cross-source JOIN', 'JSONB queries', 'SQL Interface', 'Parameter binding'],
    resultPreview: [
      { name: 'Sarah Chen', last_email: 'Re: Architecture review', meeting: 'Sync — Architecture Review', linkedin: 'Promoted to VP Engineering' },
    ],
  },
  {
    id: 'q5',
    title: 'Job Change Signals',
    description: 'Detect career transitions in your network — perfect timing for congratulations outreach.',
    category: 'signals',
    sql: `-- WHO JUST CHANGED JOBS?
-- LinkedIn signals joined with Notion contact data
SELECT
  nc.name, nc.email,
  la.detail AS what_happened,
  la.company AS new_company,
  la.role AS new_role,
  la.occurred_at,
  crg.health_score,
  crg.relationship
FROM linkedin_activity la
JOIN notion_contacts nc
  ON la.contact_email = nc.email
JOIN contact_relationship_graph crg
  ON nc.email = crg.email
WHERE la.event_type = 'job_change'
  AND la.occurred_at > NOW() - INTERVAL '30 days'
ORDER BY la.occurred_at DESC;`,
    coralFeatures: ['Cross-source JOIN', 'SQL Interface', 'Schema Learning'],
    resultPreview: [
      { name: 'Alex Kim', detail: 'Joined Anthropic as Staff Engineer', days_ago: 3, score: 78 },
      { name: 'Nadia Hassan', detail: 'Joined Figma as VP of Product', days_ago: 7, score: 18 },
      { name: 'Tom Chen', detail: 'Founded stealth AI startup', days_ago: 28, score: 72 },
    ],
  },
  {
    id: 'q6',
    title: 'Most Engaged Contacts',
    description: 'Rank contacts by total touchpoints across all channels this month — who are you spending the most time with?',
    category: 'digest',
    sql: `-- MOST ENGAGED CONTACTS THIS MONTH
-- Total touchpoints = emails + meetings + slack + twitter
SELECT
  name, email, company,
  COALESCE(total_emails_received, 0)
    + COALESCE(total_emails_sent, 0) AS email_touches,
  COALESCE(total_meetings, 0) AS meeting_touches,
  COALESCE(total_slack_messages, 0) AS slack_touches,
  COALESCE(twitter_interactions, 0) AS social_touches,
  (COALESCE(total_emails_received, 0)
    + COALESCE(total_emails_sent, 0)
    + COALESCE(total_meetings, 0)
    + COALESCE(total_slack_messages, 0)
    + COALESCE(twitter_interactions, 0)
  ) AS total_touchpoints,
  health_score
FROM contact_relationship_graph
WHERE last_contact_at > NOW() - INTERVAL '30 days'
ORDER BY total_touchpoints DESC
LIMIT 10;`,
    coralFeatures: ['SQL Interface', 'Aggregation', 'Cached View'],
    resultPreview: [
      { name: 'Priya Patel', email: 148, meetings: 12, slack: 89, social: 22, total: 271 },
      { name: 'Sam Patel', email: 41, meetings: 10, slack: 65, social: 20, total: 136 },
      { name: 'Sarah Chen', email: 42, meetings: 8, slack: 45, social: 6, total: 101 },
    ],
  },
  {
    id: 'q7',
    title: 'Coral Catalog Discovery',
    description: 'Show how an agent discovers the available source schemas before writing a query. Coral exposes source metadata as SQL tables.',
    category: 'catalog',
    sql: `-- AGENT SCHEMA DISCOVERY
-- Coral MCP exposes the catalog as SQL-readable metadata
SELECT
  schema,
  table,
  sql_reference,
  source_type,
  freshness
FROM coral.tables
WHERE schema IN ('gmail', 'calendar', 'slack', 'notion', 'linkedin', 'twitter')
ORDER BY schema, table;`,
    coralFeatures: ['Catalog Discovery', 'MCP SQL Tool', 'Source Metadata'],
    resultPreview: [
      { schema: 'gmail', table: 'threads', sql_reference: 'gmail.threads', source_type: 'mcp', freshness: '2m ago' },
      { schema: 'calendar', table: 'events', sql_reference: 'calendar.events', source_type: 'mcp', freshness: '5m ago' },
      { schema: 'notion', table: 'contacts', sql_reference: 'notion.contacts', source_type: 'api', freshness: '12m ago' },
    ],
  },
  {
    id: 'q8',
    title: 'Join Key Mapping',
    description: 'Surface the columns Coral can use as stable join keys across APIs, files, and MCP-backed sources.',
    category: 'catalog',
    sql: `-- WHICH COLUMNS CAN BE JOINED?
-- Agents inspect Coral metadata instead of guessing schemas
SELECT
  table,
  column,
  type,
  nullable,
  join_key
FROM coral.columns
WHERE join_key = true
ORDER BY table, column;`,
    coralFeatures: ['Schema Mapping', 'Source Metadata', 'Join Planning'],
    resultPreview: [
      { table: 'notion.contacts', column: 'email', type: 'TEXT', nullable: false, join_key: true },
      { table: 'gmail.threads', column: 'from_email', type: 'TEXT', nullable: false, join_key: true },
      { table: 'slack.messages', column: 'sender_email', type: 'TEXT', nullable: false, join_key: true },
    ],
  },
  {
    id: 'q9',
    title: 'Parameterized Agent Inputs',
    description: 'Demonstrates Coral-style input hints for reusable safe queries such as briefs, fading contacts, and career-signal scans.',
    category: 'ops',
    sql: `-- PARAMETER HINTS FOR AGENT QUERIES
-- Safer than asking the model to interpolate raw values
SELECT
  query,
  parameter,
  name,
  type,
  required
FROM coral.inputs
WHERE query IN ('pre_meeting_brief', 'fading_relationships', 'career_signals')
ORDER BY query, parameter;`,
    coralFeatures: ['Parameter Hints', 'Read-only SQL', 'Agent Safety'],
    resultPreview: [
      { query: 'pre_meeting_brief', parameter: '$1', name: 'contact_email', type: 'TEXT', required: true },
      { query: 'fading_relationships', parameter: '$1', name: 'min_days_since_contact', type: 'INTEGER', required: true },
      { query: 'fading_relationships', parameter: '$2', name: 'limit', type: 'INTEGER', required: false },
    ],
  },
  {
    id: 'q10',
    title: 'Cache + Freshness Trace',
    description: 'A judge-visible trace of cache hit rate, local execution timing, source fan-out, and freshness across repeated agent queries.',
    category: 'ops',
    sql: `-- CORAL QUERY OPERATIONS TRACE
-- Shows cache behavior and source fan-out for agent workloads
SELECT
  query_name,
  sources_joined,
  cache_hit_rate,
  avg_ms,
  last_cache_refresh
FROM coral.query_log
ORDER BY avg_ms DESC;`,
    coralFeatures: ['Caching', 'Freshness', 'Local Execution', 'Observability'],
    resultPreview: [
      { query_name: 'pre_meeting_brief', sources_joined: 4, cache_hit_rate: '64%', avg_ms: 24, last_cache_refresh: '2m ago' },
      { query_name: 'contact_relationship_graph', sources_joined: 6, cache_hit_rate: '73%', avg_ms: 18, last_cache_refresh: '4m ago' },
      { query_name: 'career_signals', sources_joined: 2, cache_hit_rate: '81%', avg_ms: 11, last_cache_refresh: '8m ago' },
    ],
  },
]

const categoryLabels: Record<string, { label: string; color: string; icon: string }> = {
  'cross-source': { label: 'Cross-Source JOIN', color: '#facc15', icon: '🔗' },
  health: { label: 'Health Scoring', color: '#4ade80', icon: '💚' },
  signals: { label: 'Signal Detection', color: '#60a5fa', icon: '🔔' },
  digest: { label: 'Daily Digest', color: '#a78bfa', icon: '📊' },
}

categoryLabels.catalog = { label: 'Catalog Discovery', color: '#2563eb', icon: 'SQL' }
categoryLabels.ops = { label: 'Cache & Ops', color: '#16a34a', icon: 'ms' }

function QueryCard({ query }: { query: QueryExample }) {
  const [showResult, setShowResult] = useState(false)
  const [copied, setCopied] = useState(false)
  const cat = categoryLabels[query.category] ?? {
    label: query.category === 'catalog' ? 'Catalog Discovery' : 'Cache & Ops',
    color: query.category === 'catalog' ? '#2563eb' : '#16a34a',
    icon: query.category === 'catalog' ? 'SQL' : 'ms',
  }

  const copySQL = () => {
    navigator.clipboard.writeText(query.sql)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // SQL syntax highlighting
  const highlightSQL = (sql: string) => {
    const keywords = /\b(SELECT|FROM|WHERE|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|ON|AND|OR|AS|ORDER BY|GROUP BY|LIMIT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|MATERIALIZED VIEW|WITH|CASE|WHEN|THEN|ELSE|END|IN|NOT|IS|NULL|EXISTS|BETWEEN|LIKE|HAVING|UNION|ALL|DISTINCT|INTO|VALUES|SET|INDEX|TABLE|IF|FILTER|INTERVAL|DESC|ASC|LATERAL|USING|COALESCE|GREATEST|LEAST)\b/g
    const functions = /\b(COUNT|SUM|AVG|MAX|MIN|ROUND|NOW|EXTRACT|STRING_AGG|jsonb_array_elements|jsonb_build_array|jsonb_build_object|CONCAT)\b/g
    const strings = /('[^']*')/g
    const comments = /(--[^\n]*)/g
    const numbers = /\b(\d+\.?\d*)\b/g
    const params = /(\$\d+)/g

    return sql
      .replace(comments, '<span style="color:#94a3b8;font-style:italic">$1</span>')
      .replace(strings, '<span style="color:#86efac">$1</span>')
      .replace(keywords, '<span style="color:#fde047;font-weight:700">$1</span>')
      .replace(functions, '<span style="color:#c4b5fd">$1</span>')
      .replace(params, '<span style="color:#fbbf24;font-weight:700">$1</span>')
      .replace(/\b(\d+)\b(?![^<]*>)/g, '<span style="color:#93c5fd">$1</span>')
  }

  return (
    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Category bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${cat.color}88, ${cat.color}22, transparent)` }} />

      <div style={{ padding: '20px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>{cat.icon}</span>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                {query.title}
              </h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 600 }}>
              {query.description}
            </p>
          </div>
          <span style={{
            fontSize: 10, padding: '3px 10px', borderRadius: 'var(--radius-full)',
            background: `${cat.color}15`, color: cat.color,
            border: `1px solid ${cat.color}25`,
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {cat.label}
          </span>
        </div>

        {/* Coral features used */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {query.coralFeatures.map(f => (
            <span key={f} style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 'var(--radius-full)',
              background: 'rgba(250,204,21,0.06)', color: 'var(--accent-gold)',
              border: '1px solid rgba(250,204,21,0.12)',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              ✦ {f}
            </span>
          ))}
        </div>

        {/* SQL block */}
        <div style={{
          position: 'relative',
          background: '#050807',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}>
          {/* SQL header bar */}
          <div style={{
            padding: '8px 14px',
            background: 'rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#facc15' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
              <span style={{ fontSize: 11, color: '#cbd5e1', marginLeft: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                coral-sql
              </span>
            </div>
            <button
              onClick={copySQL}
              style={{
                background: copied ? 'rgba(74,222,128,0.16)' : 'rgba(255,255,255,0.12)',
                border: `1px solid ${copied ? 'rgba(74,222,128,0.35)' : 'rgba(255,255,255,0.2)'}`,
                borderRadius: 'var(--radius-sm)', padding: '4px 10px',
                color: copied ? '#86efac' : '#e5e7eb',
                cursor: 'pointer', fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                transition: 'all 0.2s',
              }}
            >
              {copied ? '✓ Copied' : '⎘ Copy'}
            </button>
          </div>

          {/* Syntax-highlighted SQL code */}
          <pre style={{
            padding: '16px',
            fontSize: 12,
            lineHeight: 1.7,
            color: '#dbeafe',
            fontFamily: "'JetBrains Mono', monospace",
            overflowX: 'auto',
            margin: 0,
            maxHeight: 300,
          }}>
            <code dangerouslySetInnerHTML={{ __html: highlightSQL(query.sql) }} />
          </pre>
        </div>

        {/* Result preview toggle */}
        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => setShowResult(!showResult)}
            className="btn-ghost"
            style={{
              padding: '8px 14px', fontSize: 12,
              display: 'flex', alignItems: 'center', gap: 6,
              width: '100%', justifyContent: 'center',
            }}
          >
            {showResult ? '▲ Hide' : '▼ Preview'} Result
          </button>

          {showResult && (
            <div style={{
              marginTop: 10, overflowX: 'auto',
              animation: 'fadeInUp 0.3s ease-out',
            }}>
              <table style={{
                width: '100%', borderCollapse: 'collapse', fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                <thead>
                  <tr>
                    {Object.keys(query.resultPreview[0]).map(key => (
                      <th key={key} style={{
                        textAlign: 'left', padding: '8px 12px',
                        borderBottom: '1px solid var(--border-default)',
                        color: 'var(--accent-gold)', fontWeight: 500,
                        whiteSpace: 'nowrap', fontSize: 11,
                      }}>
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {query.resultPreview.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j} style={{
                          padding: '8px 12px',
                          borderBottom: '1px solid var(--border-subtle)',
                          color: 'var(--text-secondary)',
                          whiteSpace: 'nowrap',
                        }}>
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const schemas = [
  {
    table: 'gmail_threads',
    source: 'Gmail API via MCP',
    desc: 'Federated sync from Gmail mailbox. Coral handles dynamic labels and email headers on-the-fly.',
    columns: [
      { name: 'thread_id', type: 'TEXT', key: 'PRIMARY KEY', note: 'Gmail Thread ID' },
      { name: 'subject', type: 'TEXT', key: '', note: 'Email Subject' },
      { name: 'from_email', type: 'TEXT', key: 'INDEXED', note: 'Sender email' },
      { name: 'from_name', type: 'TEXT', key: '', note: 'Sender name' },
      { name: 'to_emails', type: 'TEXT[]', key: 'GIN INDEXED', note: 'Recipient array' },
      { name: 'labels', type: 'TEXT[]', key: 'LEARNT', note: 'Learned dynamically from Gmail categories/labels' },
      { name: 'sent_at', type: 'TIMESTAMPTZ', key: 'INDEXED', note: 'Timestamp' }
    ]
  },
  {
    table: 'calendar_events',
    source: 'Google Calendar API via MCP',
    desc: 'Local meeting timeline. Normalizes calendar JSON attendees array to queryable fields.',
    columns: [
      { name: 'event_id', type: 'TEXT', key: 'PRIMARY KEY', note: 'Event ID' },
      { name: 'title', type: 'TEXT', key: '', note: 'Event summary' },
      { name: 'attendees', type: 'JSONB', key: 'LEARNT', note: 'Attendees list metadata parsed dynamically' },
      { name: 'starts_at', type: 'TIMESTAMPTZ', key: 'INDEXED', note: 'Start time' },
      { name: 'duration_mins', type: 'INTEGER', key: '', note: 'Meeting duration' }
    ]
  },
  {
    table: 'notion_contacts',
    source: 'Notion Database API',
    desc: 'Central contacts directory. Adapts dynamically to custom Notion properties.',
    columns: [
      { name: 'page_id', type: 'TEXT', key: 'PRIMARY KEY', note: 'Notion page ID' },
      { name: 'name', type: 'TEXT', key: '', note: 'Full Name' },
      { name: 'email', type: 'TEXT', key: 'INDEXED', note: 'Email address' },
      { name: 'company', type: 'TEXT', key: '', note: 'Company name' },
      { name: 'role', type: 'TEXT', key: '', note: 'Designation' },
      { name: 'custom_fields', type: 'JSONB', key: 'LEARNT', note: 'Custom Notion user properties mapped on sync' }
    ]
  },
  {
    table: 'slack_messages',
    source: 'Slack API via MCP',
    desc: 'Slack channels and direct messages workspace sync.',
    columns: [
      { name: 'message_id', type: 'TEXT', key: 'PRIMARY KEY', note: 'Message ID' },
      { name: 'channel_name', type: 'TEXT', key: '', note: 'Slack channel' },
      { name: 'sender_email', type: 'TEXT', key: 'INDEXED', note: 'Sender email' },
      { name: 'content', type: 'TEXT', key: '', note: 'Text snippet' },
      { name: 'sent_at', type: 'TIMESTAMPTZ', key: 'INDEXED', note: 'Timestamp' }
    ]
  },
  {
    table: 'linkedin_activity',
    source: 'LinkedIn CSV Export/API',
    desc: 'LinkedIn professional signal records.',
    columns: [
      { name: 'id', type: 'TEXT', key: 'PRIMARY KEY', note: 'Event ID' },
      { name: 'contact_name', type: 'TEXT', key: '', note: 'Full Name' },
      { name: 'contact_email', type: 'TEXT', key: 'INDEXED', note: 'Contact email' },
      { name: 'event_type', type: 'TEXT', key: 'INDEXED', note: 'E.g. job_change, promotion, post' },
      { name: 'detail', type: 'TEXT', key: '', note: 'Details of career action' }
    ]
  }
]

export default function ExplorerPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [pageMode, setPageMode] = useState<'recipes' | 'schema' | 'sandbox'>('recipes')
  const [customSql, setCustomSql] = useState('SELECT name, company, health_score, days_since_contact FROM contact_relationship_graph WHERE health_score < 50 ORDER BY health_score DESC LIMIT 5')
  const [sandboxResults, setSandboxResults] = useState<any[] | null>(null)
  const [execTime, setExecTime] = useState<number | null>(null)
  const [sandboxCacheHit, setSandboxCacheHit] = useState<boolean | null>(null)
  const [sandboxError, setSandboxError] = useState<string | null>(null)
  const [executing, setExecuting] = useState(false)

  const filtered = activeCategory === 'all'
    ? queries
    : queries.filter(q => q.category === activeCategory)

  const runSandboxQuery = async (queryText?: string) => {
    const queryToRun = queryText || customSql
    if (!queryToRun.trim()) return
    
    setExecuting(true)
    setSandboxError(null)
    setSandboxResults(null)
    
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: queryToRun })
      })
      const data = await res.json()
      if (res.ok) {
        setSandboxResults(data.rows || [])
        setExecTime(data.durationMs)
        setSandboxCacheHit(data.cacheHit)
      } else {
        setSandboxError(data.error || 'Failed to execute query.')
      }
    } catch {
      setSandboxError('Failed to execute query. Local query gateway unreachable.')
    } finally {
      setExecuting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 40,
        padding: '14px 28px',
        background: 'rgba(10,10,8,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Coral CRM</span>
          </Link>
          <span style={{
            fontSize: 10, color: 'var(--accent-purple)',
            padding: '2px 8px', borderRadius: 'var(--radius-full)',
            background: 'rgba(167,139,250,0.08)',
            border: '1px solid rgba(167,139,250,0.15)',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
          }}>
            SQL EXPLORER
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/dashboard" className="btn-ghost" style={{ padding: '8px 14px', fontSize: 12, textDecoration: 'none' }}>
            ← Dashboard
          </Link>
          <Link href="/settings" className="btn-ghost" style={{ padding: '8px 14px', fontSize: 12, textDecoration: 'none' }}>
            Settings
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div className="animate-fade-in-up" style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            Coral SQL Explorer
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 650 }}>
            Inspect Coral SQL's capabilities—review pre-defined query blueprints, browse dynamic column schemas mapped automatically across platforms, or write and test custom queries in our playground.
          </p>
        </div>

        {/* Navigation Mode Tabs */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 28,
          borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12
        }}>
          <button
            onClick={() => setPageMode('recipes')}
            className={pageMode === 'recipes' ? 'btn-primary' : 'btn-ghost'}
            style={{ padding: '8px 16px', fontSize: 12, borderRadius: 'var(--radius-full)' }}
          >
            📋 SQL Recipes
          </button>
          <button
            onClick={() => setPageMode('schema')}
            className={pageMode === 'schema' ? 'btn-primary' : 'btn-ghost'}
            style={{ padding: '8px 16px', fontSize: 12, borderRadius: 'var(--radius-full)' }}
          >
            ✦ Learned Schema Catalog
          </button>
          <button
            onClick={() => setPageMode('sandbox')}
            className={pageMode === 'sandbox' ? 'btn-primary' : 'btn-ghost'}
            style={{ padding: '8px 16px', fontSize: 12, borderRadius: 'var(--radius-full)' }}
          >
            💻 Interactive Sandbox
          </button>
        </div>

        {/* 1. RECIPES MODE */}
        {pageMode === 'recipes' && (
          <>
            {/* Category filter */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              <button
                onClick={() => setActiveCategory('all')}
                className={activeCategory === 'all' ? 'btn-primary' : 'btn-ghost'}
                style={{ padding: '6px 14px', fontSize: 11 }}
              >
                All Recipes ({queries.length})
              </button>
              {Object.entries(categoryLabels).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={activeCategory === key ? 'btn-primary' : 'btn-ghost'}
                  style={{ padding: '6px 14px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <span>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>

            {/* Query cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="stagger-children">
              {filtered.map(query => (
                <QueryCard key={query.id} query={query} />
              ))}
            </div>
          </>
        )}

        {/* 2. SCHEMA CATALOG MODE */}
        {pageMode === 'schema' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                Dynamic Auto-Learned Schema Catalog
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Coral coordinates schema mapping dynamically across APIs and files. If database shapes change, fields adjust instantly. Below are the registered sources:
              </p>
            </div>

            {schemas.map(sch => (
              <div key={sch.table} className="glass-card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {sch.table}
                    </h3>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{sch.source}</span>
                  </div>
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 'var(--radius-full)',
                    background: 'rgba(250,204,21,0.06)', color: 'var(--accent-gold)',
                    border: '1px solid rgba(250,204,21,0.12)', fontFamily: "'JetBrains Mono', monospace"
                  }}>
                    Auto-Mapped
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                  {sch.desc}
                </p>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '12px',
                    fontFamily: "'JetBrains Mono', monospace",
                    textAlign: 'left'
                  }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)', width: '30%' }}>Column</th>
                        <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)', width: '20%' }}>Type</th>
                        <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)', width: '25%' }}>Key/Index</th>
                        <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)', width: '25%' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sch.columns.map(col => (
                        <tr key={col.name}>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {col.name}
                          </td>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                            {col.type}
                          </td>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
                            {col.key === 'LEARNT' ? (
                              <span style={{
                                fontSize: 9, padding: '1px 6px', borderRadius: 'var(--radius-sm)',
                                background: 'rgba(167,139,250,0.1)', color: 'var(--accent-purple)',
                                fontWeight: 700
                              }}>
                                ✦ SCHEMA LEARNT
                              </span>
                            ) : col.key ? (
                              <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>{col.key}</span>
                            ) : (
                              <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                            {col.note || 'Default column'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. INTERACTIVE SANDBOX MODE */}
        {pageMode === 'sandbox' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
                Interactive SQL Sandbox
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 18 }}>
                Write and execute standard SQL queries directly against Coral's federated database. Coral will coordinate the queries across Gmail, Slack, and Notion in real time.
              </p>

              {/* Textarea */}
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <textarea
                  value={customSql}
                  onChange={(e) => setCustomSql(e.target.value)}
                  style={{
                    width: '100%',
                    height: '130px',
                    background: '#050807',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '13px',
                    color: '#dbeafe',
                    resize: 'vertical'
                  }}
                  placeholder="SELECT * FROM contact_relationship_graph..."
                />
              </div>

              {/* Sandbox Templates / Presets */}
              <div style={{ marginBottom: 18 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                  PRESET TEMPLATES (CLICK TO FILL)
                </span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { label: 'All Contacts', sql: 'SELECT name, company, health_score, days_since_contact FROM contact_relationship_graph ORDER BY health_score DESC LIMIT 10' },
                    { label: 'Gmail Threads', sql: 'SELECT thread_id, subject, from_email, sent_at FROM gmail_threads LIMIT 5' },
                    { label: 'Fading Connections', sql: 'SELECT name, email, days_since_contact FROM contact_relationship_graph WHERE days_since_contact > 60' },
                    { label: 'Aggregated Metrics', sql: 'SELECT COUNT(*) AS total_contacts, AVG(health_score) AS avg_score FROM contact_relationship_graph' },
                  ].map(tmpl => (
                    <button
                      key={tmpl.label}
                      onClick={() => {
                        setCustomSql(tmpl.sql)
                        runSandboxQuery(tmpl.sql)
                      }}
                      className="btn-ghost"
                      style={{ padding: '4px 10px', fontSize: 10, borderRadius: 'var(--radius-sm)' }}
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button
                  onClick={() => runSandboxQuery()}
                  disabled={executing}
                  className="btn-primary"
                  style={{ padding: '10px 24px', fontSize: 13 }}
                >
                  {executing ? 'Executing Query...' : 'Execute SQL Query'}
                </button>
                <button
                  onClick={() => {
                    setCustomSql('')
                    setSandboxResults(null)
                    setSandboxError(null)
                    setExecTime(null)
                    setSandboxCacheHit(null)
                  }}
                  className="btn-ghost"
                  style={{ padding: '10px 20px', fontSize: 13 }}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Error panel */}
            {sandboxError && (
              <div style={{
                background: 'rgba(239,68,68,0.06)',
                border: '1.5px solid rgba(239,68,68,0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                color: '#fca5a5',
                fontSize: '13px',
                fontFamily: "'JetBrains Mono', monospace"
              }}>
                ❌ {sandboxError}
              </div>
            )}

            {/* Timings / Metrics bar */}
            {execTime !== null && (
              <div style={{
                display: 'flex',
                gap: 20,
                background: 'rgba(250,204,21,0.02)',
                border: '1px solid rgba(250,204,21,0.08)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 18px',
                fontSize: 12,
                color: 'var(--text-secondary)'
              }}>
                <div>
                  ⚡ Time: <strong style={{ color: 'var(--text-primary)' }}>{execTime}ms</strong>
                </div>
                <div>
                  💾 Cache: <strong style={{ color: sandboxCacheHit ? '#22c55e' : 'var(--accent-gold)' }}>
                    {sandboxCacheHit ? 'HIT (Coral Local Cache)' : 'MISS (Direct Source Query)'}
                  </strong>
                </div>
                <div>
                  📊 Rows: <strong style={{ color: 'var(--text-primary)' }}>{sandboxResults?.length || 0}</strong>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {sandboxResults && (
              <div className="glass-card" style={{ padding: '20px 24px', overflowX: 'auto' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
                  Query Result Set
                </h3>
                {sandboxResults.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: 13 }}>
                    Empty set. No rows returned.
                  </div>
                ) : (
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '12px',
                    fontFamily: "'JetBrains Mono', monospace",
                    textAlign: 'left'
                  }}>
                    <thead>
                      <tr>
                        {Object.keys(sandboxResults[0]).map(key => (
                          <th key={key} style={{
                            padding: '10px 12px',
                            borderBottom: '1.5px solid var(--border-default)',
                            color: 'var(--accent-gold)',
                            fontWeight: 600
                          }}>
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sandboxResults.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((val, j) => (
                            <td key={j} style={{
                              padding: '10px 12px',
                              borderBottom: '1px solid var(--border-subtle)',
                              color: 'var(--text-secondary)',
                              whiteSpace: 'nowrap'
                            }}>
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{
          marginTop: 40, textAlign: 'center', padding: '24px',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(250,204,21,0.04)',
          border: '1px solid rgba(250,204,21,0.1)',
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            These queries power the entire CRM
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
            Every dashboard stat, contact card, AI brief, and daily digest is built on Coral&apos;s cross-source SQL joins. No custom ETL pipelines needed.
          </div>
          <Link href="/dashboard" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 24px', fontSize: 14 }}>
            See it in action →
          </Link>
        </div>
      </main>
    </div>
  )
}
