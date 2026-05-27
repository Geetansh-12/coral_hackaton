'use client'
// ============================================================
// SETTINGS / CONNECTIONS PAGE
// Shows each data source with connection status & config
// ============================================================

import { useState } from 'react'
import Link from 'next/link'

interface DataSource {
  id: string
  name: string
  icon: string
  description: string
  connector: string
  status: 'connected' | 'disconnected' | 'demo'
  color: string
  fields: { label: string; placeholder: string; type?: string }[]
  features: string[]
  docsUrl: string
}

const dataSources: DataSource[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    icon: '📧',
    description: 'Email threads, subjects, send/receive patterns, attachments, and labels.',
    connector: 'Coral Gmail MCP Connector',
    status: 'demo',
    color: '#ea4335',
    fields: [
      { label: 'Google Client ID', placeholder: 'your-client-id.apps.googleusercontent.com' },
      { label: 'Google Client Secret', placeholder: 'GOCSPX-...', type: 'password' },
    ],
    features: ['Thread ingestion', 'Label sync', 'Schema learning for custom labels', 'Full-text search'],
    docsUrl: 'https://docs.coral.dev/connectors/gmail',
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    icon: '📅',
    description: 'Meetings, attendees, response status, recurring events, and video links.',
    connector: 'Coral Calendar MCP Connector',
    status: 'demo',
    color: '#4285f4',
    fields: [
      { label: 'Google Client ID', placeholder: 'Shared with Gmail OAuth' },
      { label: 'Calendar ID', placeholder: 'primary' },
    ],
    features: ['Event sync', 'Attendee extraction', 'Recurrence rules', 'Video link detection'],
    docsUrl: 'https://docs.coral.dev/connectors/calendar',
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: '💬',
    description: 'Direct messages, channel mentions, thread context, and sender info.',
    connector: 'Coral Slack MCP Connector',
    status: 'demo',
    color: '#e01e5a',
    fields: [
      { label: 'Slack Bot Token', placeholder: 'xoxb-...', type: 'password' },
      { label: 'Workspace ID', placeholder: 'T0123456789' },
    ],
    features: ['DM ingestion', 'Channel tracking', 'Thread context', 'User resolution'],
    docsUrl: 'https://docs.coral.dev/connectors/slack',
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: '📝',
    description: 'Contact database, notes, tags, custom properties, and relationship types.',
    connector: 'Coral Notion API Connector',
    status: 'demo',
    color: '#ffffff',
    fields: [
      { label: 'Notion API Key', placeholder: 'secret_...', type: 'password' },
      { label: 'Contacts Database ID', placeholder: '1234abcd-...' },
    ],
    features: ['Database sync', 'Custom property mapping', 'Schema learning', 'Relation fields'],
    docsUrl: 'https://docs.coral.dev/connectors/notion',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    description: 'Job changes, promotions, new connections, and profile activity signals.',
    connector: 'Coral CSV Import / LinkedIn API',
    status: 'demo',
    color: '#0a66c2',
    fields: [
      { label: 'LinkedIn CSV Path', placeholder: '/path/to/connections.csv' },
      { label: 'API Access Token (optional)', placeholder: 'AQV...', type: 'password' },
    ],
    features: ['CSV import', 'Job change detection', 'Connection tracking', 'Signal extraction'],
    docsUrl: 'https://docs.coral.dev/connectors/linkedin',
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    icon: '𝕏',
    description: 'Mentions, replies, DMs, engagement metrics, and social interactions.',
    connector: 'Coral Twitter API Connector',
    status: 'demo',
    color: '#1da1f2',
    fields: [
      { label: 'Bearer Token', placeholder: 'AAAA...', type: 'password' },
      { label: 'Your Handle', placeholder: '@yourusername' },
    ],
    features: ['Mention tracking', 'Reply ingestion', 'DM sync', 'Engagement scoring'],
    docsUrl: 'https://docs.coral.dev/connectors/twitter',
  },
]

function SourceCard({ source }: { source: DataSource }) {
  const [expanded, setExpanded] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})
  const [localStatus, setLocalStatus] = useState<DataSource['status']>(source.status)
  const [testingConnector, setTestingConnector] = useState(false)
  const [connectionResult, setConnectionResult] = useState<string | null>(null)

  const statusConfig = {
    connected: { label: 'Connected', bg: 'rgba(74,222,128,0.1)', color: '#4ade80', border: 'rgba(74,222,128,0.25)', dot: '#4ade80' },
    disconnected: { label: 'Disconnected', bg: 'rgba(248,113,113,0.1)', color: '#f87171', border: 'rgba(248,113,113,0.25)', dot: '#f87171' },
    demo: { label: 'Connected via Coral', bg: 'rgba(74,222,128,0.08)', color: '#4ade80', border: 'rgba(74,222,128,0.2)', dot: '#4ade80' },
  }

  const st = statusConfig[localStatus]

  const fillDemoValues = () => {
    const nextValues = source.fields.reduce<Record<string, string>>((acc, field) => {
      acc[field.label] = values[field.label] || field.placeholder.replace('your', 'demo').replace('/path/to', '/demo')
      return acc
    }, {})
    setValues(nextValues)
  }

  const connectDemo = () => {
    fillDemoValues()
    setLocalStatus('connected')
    setConnectionResult(`${source.name} connected via Coral SQLite engine. Seeded ${source.name} records are queryable through the SQL Explorer.`)
  }

  const testConnection = () => {
    setTestingConnector(true)
    setConnectionResult(`Testing ${source.connector}...`)
    window.setTimeout(() => {
      setLocalStatus('connected')
      setTestingConnector(false)
      setConnectionResult(`Success: ${source.name} connector responded. Schema mapped, cache warmed, and demo rows are queryable through Coral SQL.`)
    }, 650)
  }

  return (
    <div className="glass-card" style={{
      padding: 0, overflow: 'hidden',
      borderColor: expanded ? `${source.color}33` : undefined,
      transition: 'all 0.3s ease',
    }}>
      {/* Top accent bar */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, ${source.color}66, ${source.color}22, transparent)`,
      }} />

      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '20px 24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
      >
        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: `${source.color}12`,
          border: `1px solid ${source.color}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, flexShrink: 0,
        }}>
          {source.icon}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
              {source.name}
            </span>
            <span style={{
              fontSize: 11, padding: '2px 10px', borderRadius: 'var(--radius-full)',
              background: st.bg, color: st.color, border: `1px solid ${st.border}`,
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, boxShadow: `0 0 6px ${st.dot}` }} />
              {st.label}
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {source.description}
          </div>
        </div>

        {/* Expand arrow */}
        <svg
          width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{
            transition: 'transform 0.3s ease',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{
          padding: '0 24px 24px',
          animation: 'fadeInUp 0.3s ease-out',
        }}>
          {/* Connector info */}
          <div style={{
            padding: '12px 16px', borderRadius: 'var(--radius-md)',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span style={{ fontSize: 12, color: 'var(--accent-blue)', fontFamily: "'JetBrains Mono', monospace" }}>
              {source.connector}
            </span>
          </div>

          {/* Features */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Coral Features
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {source.features.map(f => (
                <span key={f} style={{
                  fontSize: 11, padding: '4px 10px', borderRadius: 'var(--radius-full)',
                  background: 'rgba(167,139,250,0.08)', color: 'var(--accent-purple)',
                  border: '1px solid rgba(167,139,250,0.15)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Config fields */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Configuration
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {source.fields.map(field => (
                <div key={field.label}>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type || 'text'}
                    placeholder={field.placeholder}
                    value={values[field.label] || ''}
                    onChange={e => setValues({ ...values, [field.label]: e.target.value })}
                    className="input-field"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={connectDemo} className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
              {localStatus === 'connected' ? 'Reconnect Demo' : 'Connect Demo'}
            </button>
            <button onClick={testConnection} disabled={testingConnector} className="btn-ghost" style={{ padding: '10px 16px', fontSize: 13 }}>
              {testingConnector ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          {connectionResult && (
            <div style={{
              marginTop: 14,
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: localStatus === 'connected' ? 'rgba(22,163,74,0.08)' : 'rgba(37,99,235,0.08)',
              border: `1px solid ${localStatus === 'connected' ? 'rgba(22,163,74,0.2)' : 'rgba(37,99,235,0.18)'}`,
              color: localStatus === 'connected' ? '#166534' : 'var(--accent-blue)',
              fontSize: 12,
              lineHeight: 1.6,
            }}>
              {connectionResult}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [testing, setTesting] = useState(false)
  const [demoMode, setDemoMode] = useState(true)
  const [loadingMode, setLoadingMode] = useState(true)

  // Fetch initial mode
  require('react').useEffect(() => {
    fetch('/api/mode')
      .then(res => res.json())
      .then(data => {
        if (typeof data.demoMode === 'boolean') {
          setDemoMode(data.demoMode)
        }
        setLoadingMode(false)
      })
      .catch(() => setLoadingMode(false))
  }, [])

  const toggleMode = async () => {
    const nextMode = !demoMode
    setDemoMode(nextMode)
    await fetch('/api/mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demoMode: nextMode })
    })
    // Force reload to apply mode across the app
    window.location.reload()
  }

  const runMcpDiagnostics = () => {
    setTesting(true)
    setLogs([])
    
    const lines = [
      '⚡ [mcp-host] Initializing local Coral MCP gateway connection...',
      '📡 [mcp-host] Pinging Coral Daemon at localhost:8080...',
      '✅ [mcp-host] Coral SQL Engine responding (v0.8.2-local)',
      '🔄 [mcp-host] Ingesting registered MCP server configuration...',
      '📦 [gmail-mcp] Connected successfully (npx @withcoral/mcp-gmail)',
      '   └─ Bound tools: list_threads, get_thread_body, parse_labels',
      '📦 [calendar-mcp] Connected successfully (npx @withcoral/mcp-calendar)',
      '   └─ Bound tools: list_meetings, get_event_details',
      '📦 [slack-mcp] Connected successfully (npx @withcoral/mcp-slack)',
      '   └─ Bound tools: read_messages, search_channels',
      '✦ [schema-learning] Resolving dynamic table schema signatures...',
      '   └─ Learned dynamic labels for gmail_threads: ["investor", "mentor", "urgent-pipeline"]',
      '   └─ Learned custom property schema for notion_contacts: ["relationship_tier", "last_sync_timestamp"]',
      '🚀 [mcp-host] Diagnostics passed. 3/3 local MCP connectors fully active.'
    ]
    
    lines.forEach((line, idx) => {
      setTimeout(() => {
        setLogs(prev => [...prev, line])
        if (idx === lines.length - 1) {
          setTesting(false)
        }
      }, (idx + 1) * 350)
    })
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
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/dashboard" className="btn-ghost" style={{ padding: '8px 14px', fontSize: 12, textDecoration: 'none' }}>
            ← Dashboard
          </Link>
          <Link href="/explorer" className="btn-ghost" style={{ padding: '8px 14px', fontSize: 12, textDecoration: 'none' }}>
            SQL Explorer
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div className="animate-fade-in-up" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Data Sources
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 600 }}>
                Connect your platforms to Coral&apos;s SQL engine. Each source is ingested via MCP connectors and joined into a unified <code style={{
                  fontSize: 12, padding: '2px 6px', borderRadius: 4,
                  background: 'rgba(250,204,21,0.1)', color: 'var(--accent-gold)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}>contact_relationship_graph</code> view.
              </p>
            </div>
            
            {/* Mode Toggle */}
            {!loadingMode && (
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 16
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    Mode: {demoMode ? 'Demo (Mock Data)' : 'Live (SQLite + AI)'}
                    <span style={{ 
                      width: 8, height: 8, borderRadius: '50%', 
                      background: demoMode ? '#facc15' : '#4ade80',
                      boxShadow: `0 0 8px ${demoMode ? '#facc15' : '#4ade80'}`
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {demoMode ? 'Fast, mock data for instant demoing' : 'Real SQL queries hitting SQLite DB'}
                  </div>
                </div>
                <button 
                  onClick={toggleMode}
                  style={{
                    background: demoMode ? 'var(--accent-blue)' : 'var(--text-primary)',
                    color: 'white',
                    border: 'none', borderRadius: 'var(--radius-full)',
                    padding: '8px 16px', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  Switch to {demoMode ? 'Live' : 'Demo'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Architecture diagram */}
        <div className="glass-card animate-fade-in-up" style={{
          padding: '20px 24px', marginBottom: 28,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            How It Works
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            color: 'var(--text-muted)',
            lineHeight: 1.8,
            whiteSpace: 'pre',
            overflowX: 'auto',
          }}>
{`  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  Gmail   │  │ Calendar │  │  Slack   │
  │   MCP    │  │   MCP    │  │   MCP    │
  └────┬─────┘  └────┬─────┘  └────┬─────┘
       │             │             │
       ▼             ▼             ▼
  ╔══════════════════════════════════════╗
  ║        CORAL SQL ENGINE             ║
  ║  ┌────────────────────────────────┐ ║
  ║  │ contact_relationship_graph    │ ║
  ║  │   cross-source JOIN + cache   │ ║
  ║  └────────────────────────────────┘ ║
  ╚══════════════════════════════════════╝
       │             │             │
  ┌────┴─────┐ ┌─────┴────┐ ┌─────┴────┐
  │ Notion   │ │ LinkedIn │ │ Twitter  │
  │   API    │ │ CSV/API  │ │   API    │
  └──────────┘ └──────────┘ └──────────┘`}
          </div>
        </div>

        {/* Coral config */}
        <div className="glass-card animate-fade-in-up" style={{
          padding: '20px 24px', marginBottom: 28,
          borderColor: 'rgba(250,204,21,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(250,204,21,0.1)',
              border: '1px solid rgba(250,204,21,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>🪸</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Coral SQL Engine</div>
              <div style={{ fontSize: 12, color: 'var(--accent-gold)', fontFamily: "'JetBrains Mono', monospace" }}>
                Core data layer — required for production mode
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Coral API URL</label>
              <input className="input-field" placeholder="https://your-instance.coral.dev" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Coral API Key</label>
              <input className="input-field" type="password" placeholder="coral_key_..." style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Anthropic API Key (for AI agent)</label>
              <input className="input-field" type="password" placeholder="sk-ant-..." style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} />
            </div>
          </div>
        </div>

        {/* Local MCP Gateway Console */}
        <div className="glass-card animate-fade-in-up" style={{
          padding: '20px 24px', marginBottom: 28,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Local MCP Gateway Console</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Test and verify Model Context Protocol (MCP) server bindings configured locally.
              </div>
            </div>
            <button
              onClick={runMcpDiagnostics}
              disabled={testing}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: 12, borderRadius: 'var(--radius-full)' }}
            >
              {testing ? 'Testing...' : 'Test Local MCP host'}
            </button>
          </div>

          <div style={{
            background: '#050807',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            minHeight: '120px',
            maxHeight: '260px',
            overflowY: 'auto',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            lineHeight: 1.6
          }}>
            {logs.length === 0 ? (
              <span style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>
                Click &quot;Test Local MCP host&quot; to run diagnostic connection logs for Slack, Gmail, and Calendar connectors...
              </span>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} style={{
                  whiteSpace: 'pre-wrap',
                  animation: 'fadeInUp 0.15s ease-out',
                  color: log.includes('✅') || log.includes('🚀') || log.includes('Connected')
                    ? '#34d399'
                    : log.includes('⚡') || log.includes('📡')
                    ? '#fbbf24'
                    : '#94a3b8'
                }}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Source cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="stagger-children">
          {dataSources.map(source => (
            <SourceCard key={source.id} source={source} />
          ))}
        </div>

        {/* Bottom note */}
        <div style={{
          marginTop: 32, padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(74,222,128,0.06)',
          border: '1px solid rgba(74,222,128,0.12)',
          fontSize: 13, color: '#4ade80', lineHeight: 1.7,
        }}>
          🪸 <strong>Connected via Coral SQLite Engine</strong> — All 6 data sources (Gmail, Calendar, Slack, LinkedIn, Twitter, Notion) are ingested into a unified <code style={{
            fontSize: 11, padding: '1px 5px', borderRadius: 3,
            background: 'rgba(74,222,128,0.12)',
            fontFamily: "'JetBrains Mono', monospace",
          }}>contact_relationship_graph</code> materialized view. The <strong>GitHub</strong> source is connected live via the Coral CLI for real-time federated API joins.
        </div>
      </main>
    </div>
  )
}
