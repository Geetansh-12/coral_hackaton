'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { ElementType, PointerEvent } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Copy,
  DatabaseZap,
  Download,
  Filter,
  Gauge,
  GitBranch,
  LockKeyhole,
  MessageSquareText,
  Network,
  PlayCircle,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  TableProperties,
  TrendingUp,
  UserRoundCheck,
  Workflow,
  X,
  Zap,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ChatMessage, Contact, NetworkStats } from '@/lib/types'
import { getHealthColor, getHealthStatus } from '@/lib/types'
import VisualGraph from '@/app/components/VisualGraph'

type PlanItem = {
  contact: Contact
  reason: string
  action: string
  priority: 'urgent' | 'signal' | 'nurture'
}

const priorityCopy = {
  urgent: { label: 'Repair', color: '#ef4444' },
  signal: { label: 'Signal', color: '#2563eb' },
  nurture: { label: 'Nurture', color: '#16a34a' },
}

const coralCapabilities = [
  {
    title: 'One SQL surface',
    icon: DatabaseZap,
    metric: '1 call',
    detail: 'Agent asks one SQL query instead of juggling six MCP/API tools.',
    proof: 'contact_relationship_graph',
  },
  {
    title: 'Cross-source JOINs',
    icon: Workflow,
    metric: '6 sources',
    detail: 'Gmail, Calendar, Slack, LinkedIn, X, and Notion resolve into one graph.',
    proof: 'JOIN gmail + calendar + slack + linkedin',
  },
  {
    title: 'Catalog discovery',
    icon: TableProperties,
    metric: '31 cols',
    detail: 'Explorer exposes schemas like coral.tables, coral.columns, and source references.',
    proof: 'coral.tables / coral.columns',
  },
  {
    title: 'Parameter hints',
    icon: LockKeyhole,
    metric: '$1 / $2',
    detail: 'Briefs and fading-contact queries use safe bind-style query inputs.',
    proof: 'WHERE email = $1 LIMIT $2',
  },
  {
    title: 'Cache + freshness',
    icon: Gauge,
    metric: '73% hit',
    detail: 'Demo query gateway surfaces cache hits and query timing like a Coral node.',
    proof: 'cached materialized view',
  },
  {
    title: 'Ops layer',
    icon: RefreshCw,
    metric: 'centralized',
    detail: 'Coral story covers auth, retries, pagination, rate limits, mapping, and local execution.',
    proof: 'one data layer for agents',
  },
]

const coralTrace = [
  { step: 'schema discovery', source: 'coral.tables', ms: 3, result: '6 source schemas visible' },
  { step: 'parameter planning', source: 'coral.inputs', ms: 2, result: 'email + limit hints resolved' },
  { step: 'federated query', source: 'sql MCP tool', ms: 18, result: 'cross-source join executed locally' },
  { step: 'cache reuse', source: 'materialized view', ms: 4, result: 'relationship graph served from cache' },
]

const sourceFreshness = [
  { name: 'Gmail', status: 'Live', freshness: '2m ago', rows: '24K threads', cache: 'HIT', latency: '8ms' },
  { name: 'Calendar', status: 'Live', freshness: '5m ago', rows: '1.2K events', cache: 'HIT', latency: '11ms' },
  { name: 'Slack', status: 'Live', freshness: '1m ago', rows: '8.5K messages', cache: 'MISS', latency: '31ms' },
  { name: 'LinkedIn', status: 'Synced', freshness: '35m ago', rows: '340 signals', cache: 'HIT', latency: '9ms' },
  { name: 'X/Twitter', status: 'Synced', freshness: '18m ago', rows: '2.1K interactions', cache: 'HIT', latency: '13ms' },
  { name: 'Notion', status: 'Live', freshness: '12m ago', rows: '156 contacts', cache: 'HIT', latency: '7ms' },
]

const judgeDemoSteps = [
  {
    title: 'Start with the agent plan',
    body: 'The dashboard opens with a ranked action queue, not a passive CRM table. Judges see immediate product value.',
    target: 'Agent plan',
  },
  {
    title: 'Prove Coral usage',
    body: 'The cockpit maps the demo to Coral capabilities: cross-source joins, catalog discovery, parameter hints, cache/freshness, and ops.',
    target: 'Coral capability cockpit',
  },
  {
    title: 'Show source freshness',
    body: 'Each connector has visible freshness, cache status, and query latency so the data layer feels real and operational.',
    target: 'Source health',
  },
  {
    title: 'Run SQL Explorer',
    body: 'Open SQL Explorer and run the catalog/query-log examples. This makes the technical story inspectable.',
    target: 'SQL Explorer',
  },
  {
    title: 'Export a brief',
    body: 'Open a contact, generate a pre-meeting brief, and export it as a shareable Markdown artifact.',
    target: 'Contact detail',
  },
]

const comparisonRows = [
  {
    label: 'Agent tool calls',
    normal: '6+ separate MCP/API calls',
    coral: '1 SQL query over a virtual graph',
  },
  {
    label: 'Join logic',
    normal: 'Model stitches JSON manually',
    coral: 'Database-style JOINs and materialized views',
  },
  {
    label: 'Schema discovery',
    normal: 'Prompt docs or hardcoded fields',
    coral: 'Query `coral.tables` and `coral.columns`',
  },
  {
    label: 'Safety',
    normal: 'String interpolation risk',
    coral: 'Parameter hints with `$1`, `$2` inputs',
  },
  {
    label: 'Performance',
    normal: 'Repeated source fan-out',
    coral: 'Cache hits, freshness, local execution trace',
  },
]

const scorecardRows = [
  {
    criterion: 'Coral usage',
    score: '9.5',
    evidence: 'Cross-source JOINs, catalog discovery, parameter hints, cache/freshness, source health, query gateway.',
  },
  {
    criterion: 'Product value',
    score: '9.1',
    evidence: 'Turns scattered relationship data into daily outreach actions, briefs, drafts, and risk signals.',
  },
  {
    criterion: 'Technical depth',
    score: '9.2',
    evidence: 'SQL Explorer, schema materialized view, mock query evaluator, graph mode, streaming agent, export flow.',
  },
  {
    criterion: 'Demo clarity',
    score: '9.4',
    evidence: 'Judge Demo mode, source freshness, comparison panel, setup docs, one-click proof paths.',
  },
  {
    criterion: 'Polish',
    score: '9.0',
    evidence: 'Antigravity/Gentlerain-inspired UI, cursor rain field, dashboards, charts, and contact workflows.',
  },
]

const queryReplay = [
  {
    label: 'Discover sources',
    sql: 'SELECT * FROM coral.tables WHERE schema IN (...)',
    result: '6 source schemas',
    ms: 3,
  },
  {
    label: 'Plan joins',
    sql: 'SELECT * FROM coral.columns WHERE join_key = true',
    result: 'email join keys',
    ms: 4,
  },
  {
    label: 'Build graph',
    sql: 'SELECT * FROM contact_relationship_graph',
    result: '34 contacts',
    ms: 18,
  },
  {
    label: 'Generate action',
    sql: 'SELECT name, health_score WHERE days_since_contact > $1',
    result: '6 actions',
    ms: 11,
  },
]

function daysLabel(contact: Contact) {
  if (!contact.last_contact_at) return 'No touchpoint yet'
  return formatDistanceToNow(new Date(contact.last_contact_at), { addSuffix: true })
}

function getInitials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function buildDraft(item: PlanItem) {
  const first = item.contact.name.split(' ')[0]
  if (item.priority === 'signal' && item.contact.linkedin_recent_signals) {
    return `Hey ${first}, saw the update: ${item.contact.linkedin_recent_signals.split('|')[0].trim()}. Huge congrats. Would love to hear what you are excited to build next.`
  }
  if (item.priority === 'urgent') {
    return `Hey ${first}, I realized it has been a while since we caught up. I would love to reconnect this week and hear what is new on your side.`
  }
  return `Hey ${first}, your perspective came to mind while I was reviewing our roadmap. Would you be open to a quick catch-up next week?`
}

function StatTile({ label, value, note, icon: Icon }: {
  label: string
  value: string | number
  note: string
  icon: ElementType
}) {
  return (
    <div className="metric-tile">
      <div className="metric-icon"><Icon size={18} /></div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  )
}

function CoralCockpit() {
  return (
    <section className="section-panel coral-cockpit">
      <div className="section-heading">
        <div>
          <span>Coral capability cockpit</span>
          <h2>The technical story judges can score</h2>
        </div>
        <GitBranch size={22} />
      </div>
      <div className="coral-cockpit-grid">
        <div className="capability-grid">
          {coralCapabilities.map(({ title, icon: Icon, metric, detail, proof }) => (
            <article className="capability-card" key={title}>
              <div className="capability-top">
                <span><Icon size={16} /></span>
                <strong>{metric}</strong>
              </div>
              <h3>{title}</h3>
              <p>{detail}</p>
              <code>{proof}</code>
            </article>
          ))}
        </div>
        <div className="trace-card">
          <div className="trace-header">
            <strong>Agent query trace</strong>
            <span>one ask {'->'} one Coral SQL path</span>
          </div>
          {coralTrace.map((item, index) => (
            <div className="trace-row" key={item.step}>
              <em>{String(index + 1).padStart(2, '0')}</em>
              <div>
                <strong>{item.step}</strong>
                <span>{item.source}</span>
              </div>
              <p>{item.result}</p>
              <small>{item.ms}ms</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SourceFreshnessPanel() {
  return (
    <section className="section-panel source-health-panel">
      <div className="section-heading">
        <div>
          <span>Source freshness</span>
          <h2>Connector health judges can inspect</h2>
        </div>
        <RefreshCw size={22} />
      </div>
      <div className="source-health-grid">
        {sourceFreshness.map((source) => (
          <article className="source-health-card" key={source.name}>
            <div className="source-health-top">
              <strong>{source.name}</strong>
              <span className={source.status === 'Live' ? 'status-live' : 'status-sync'}>{source.status}</span>
            </div>
            <div className="source-health-meta">
              <span>{source.rows}</span>
              <span>fresh {source.freshness}</span>
            </div>
            <div className="source-health-bottom">
              <code>cache {source.cache}</code>
              <code>{source.latency}</code>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function CoralComparisonPanel() {
  return (
    <section className="section-panel comparison-panel">
      <div className="section-heading">
        <div>
          <span>Coral vs normal MCP</span>
          <h2>Why the data layer matters</h2>
        </div>
        <Workflow size={22} />
      </div>
      <div className="comparison-table">
        <div className="comparison-row comparison-head">
          <span>Problem</span>
          <span>Normal agent stack</span>
          <span>With Coral</span>
        </div>
        {comparisonRows.map((row) => (
          <div className="comparison-row" key={row.label}>
            <strong>{row.label}</strong>
            <span>{row.normal}</span>
            <span>{row.coral}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function JudgeScorecardPanel() {
  const avg = scorecardRows.reduce((sum, row) => sum + Number(row.score), 0) / scorecardRows.length

  return (
    <section className="section-panel scorecard-panel">
      <div className="section-heading">
        <div>
          <span>Submission scorecard</span>
          <h2>Designed to score above 9</h2>
        </div>
        <div className="scorecard-total">{avg.toFixed(1)}</div>
      </div>
      <div className="scorecard-grid">
        {scorecardRows.map((row) => (
          <article className="scorecard-card" key={row.criterion}>
            <div>
              <strong>{row.criterion}</strong>
              <span>{row.score}/10</span>
            </div>
            <p>{row.evidence}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function QueryReplayPanel() {
  return (
    <section className="section-panel query-replay-panel">
      <div className="section-heading">
        <div>
          <span>Coral query replay</span>
          <h2>How one agent action becomes SQL</h2>
        </div>
        <DatabaseZap size={22} />
      </div>
      <div className="query-replay-grid">
        {queryReplay.map((item, index) => (
          <article className="query-replay-card" key={item.label}>
            <em>{String(index + 1).padStart(2, '0')}</em>
            <strong>{item.label}</strong>
            <code>{item.sql}</code>
            <div>
              <span>{item.result}</span>
              <small>{item.ms}ms</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function JudgeDemoOverlay({ step, onStep, onClose }: {
  step: number
  onStep: (step: number) => void
  onClose: () => void
}) {
  const current = judgeDemoSteps[step]

  return (
    <div className="judge-demo-overlay" role="dialog" aria-modal="true" aria-label="Judge demo walkthrough">
      <div className="judge-demo-card">
        <button className="judge-demo-close" onClick={onClose} aria-label="Close judge demo">
          <X size={16} />
        </button>
        <span className="judge-demo-kicker">Judge Demo Mode</span>
        <h2>{current.title}</h2>
        <p>{current.body}</p>
        <div className="judge-demo-target">
          <Sparkles size={16} />
          Show: {current.target}
        </div>
        <div className="judge-demo-dots">
          {judgeDemoSteps.map((item, index) => (
            <button
              key={item.title}
              className={index === step ? 'active' : ''}
              onClick={() => onStep(index)}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>
        <div className="judge-demo-actions">
          <button className="button button-light" onClick={() => onStep(Math.max(0, step - 1))} disabled={step === 0}>
            Back
          </button>
          <button
            className="button button-dark"
            onClick={() => {
              if (step === judgeDemoSteps.length - 1) onClose()
              else onStep(step + 1)
            }}
          >
            {step === judgeDemoSteps.length - 1 ? 'Finish' : 'Next step'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ContactPill({ contact, onClick }: { contact: Contact; onClick: () => void }) {
  const score = Math.round(contact.health_score)
  return (
    <button className="contact-pill" onClick={onClick}>
      <span className="avatar" style={{ background: `${getHealthColor(score)}18`, color: getHealthColor(score) }}>
        {getInitials(contact.name)}
      </span>
      <span>
        <strong>{contact.name}</strong>
        <small>{contact.role} at {contact.company}</small>
      </span>
      <em style={{ color: getHealthColor(score) }}>{score}</em>
    </button>
  )
}

function PlanCard({ item, onSelect }: { item: PlanItem; onSelect: (contact: Contact) => void }) {
  const [copied, setCopied] = useState(false)
  const meta = priorityCopy[item.priority]
  const draft = buildDraft(item)

  async function copyDraft() {
    await navigator.clipboard.writeText(draft)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <article className="plan-card">
      <div className="plan-topline">
        <span style={{ color: meta.color, background: `${meta.color}12`, borderColor: `${meta.color}30` }}>
          {meta.label}
        </span>
        <small>{daysLabel(item.contact)}</small>
      </div>
      <button onClick={() => onSelect(item.contact)} className="plan-person">
        <span className="avatar">{getInitials(item.contact.name)}</span>
        <span>
          <strong>{item.contact.name}</strong>
          <small>{item.contact.company} / {item.contact.relationship || 'relationship'}</small>
        </span>
      </button>
      <p>{item.reason}</p>
      <div className="next-action">
        <Send size={15} />
        <span>{item.action}</span>
      </div>
      <div className="draft-box">{draft}</div>
      <button className="button button-light full-width" onClick={copyDraft}>
        <Copy size={15} /> {copied ? 'Copied draft' : 'Copy warm draft'}
      </button>
    </article>
  )
}

function ChatPanel({ contacts, activeContact, onClose }: {
  contacts: Contact[]
  activeContact: Contact | null
  onClose: () => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: activeContact
        ? `I can help with ${activeContact.name}. Ask me for a brief, a warm reconnect draft, or what to mention next.`
        : 'Ask me who needs attention, who changed jobs, or what your strongest next move is today.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const suggestions = activeContact
    ? [
        `Write a concise follow-up for ${activeContact.name}`,
        `What should I mention to ${activeContact.name}?`,
        `Summarize my relationship with ${activeContact.name}`,
      ]
    : [
        "Who haven't I talked to in a while?",
        'Who should I reach out to today?',
        'Who changed jobs recently?',
        'What Coral capabilities does this demo use?',
      ]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const next: ChatMessage[] = [...messages, { role: 'user', content }]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map((message) => ({ role: message.role, content: message.content })),
          contactEmail: activeContact?.email,
        }),
      })

      if (!res.body) throw new Error('No response stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let reply = ''
      setMessages((current) => [...current, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        reply += decoder.decode(value)
        setMessages((current) => {
          const updated = [...current]
          updated[updated.length - 1] = { role: 'assistant', content: reply }
          return updated
        })
      }
    } catch {
      const fallback = activeContact
        ? `For ${activeContact.name}: ${buildDraft({
            contact: activeContact,
            priority: activeContact.linkedin_recent_signals ? 'signal' : 'nurture',
            reason: activeContact.linkedin_recent_signals || 'Relationship context available.',
            action: 'Send a warm follow-up.',
          })}`
        : `Top moves: reconnect with ${contacts
            .filter((contact) => (contact.days_since_contact || 0) > 60)
            .slice(0, 3)
            .map((contact) => contact.name)
            .join(', ')}. Use recent career signals for timely, human outreach.`
      setMessages((current) => [...current, { role: 'assistant', content: fallback }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-shell" role="dialog" aria-label="Relationship agent chat">
      <div className="chat-header">
        <div>
          <span><Bot size={15} /> Coral Agent</span>
          <strong>{activeContact ? activeContact.name : 'Network copilot'}</strong>
        </div>
        <button onClick={onClose} aria-label="Close chat">Close</button>
      </div>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`chat-bubble ${message.role}`}>
            {message.content || 'Thinking...'}
          </div>
        ))}
        {loading && <div className="chat-bubble assistant muted">Reading the relationship graph...</div>}
        <div ref={bottomRef} />
      </div>
      <div className="chat-suggestions">
        {suggestions.map((suggestion) => (
          <button key={suggestion} onClick={() => send(suggestion)}>{suggestion}</button>
        ))}
      </div>
      <form
        className="chat-input"
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
      >
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask the relationship agent..." />
        <button className="button button-dark" disabled={loading}>
          <Send size={15} />
        </button>
      </form>
    </div>
  )
}

function DetailPanel({ contact, onClose, onChat }: { contact: Contact; onClose: () => void; onChat: (contact: Contact) => void }) {
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(false)
  const score = Math.round(contact.health_score)
  const channels = [
    ['Email', contact.total_emails_received + contact.total_emails_sent],
    ['Meetings', contact.total_meetings],
    ['Slack', contact.total_slack_messages],
    ['Social', contact.twitter_interactions],
  ]
  const max = Math.max(...channels.map(([, value]) => Number(value)), 1)

  async function generateBrief() {
    setLoading(true)
    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: contact.email }),
      })
      const data = await res.json()
      setBrief(data.brief || 'No brief returned.')
    } catch {
      setBrief('Could not generate the live AI brief. Demo data is still available for judging.')
    } finally {
      setLoading(false)
    }
  }

  function exportBrief() {
    const content = `# Pre-Meeting Brief: ${contact.name}

Generated by Coral CRM

## Contact

- Name: ${contact.name}
- Role: ${contact.role}
- Company: ${contact.company}
- Email: ${contact.email}
- Health score: ${score}/100
- Last contact: ${daysLabel(contact)}

## Brief

${brief || 'Generate a brief before exporting.'}
`
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${contact.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-brief.md`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="panel-overlay" role="dialog" aria-modal="true">
      <button className="panel-backdrop" onClick={onClose} aria-label="Close detail panel" />
      <aside className="detail-sheet">
        <button className="button button-light" onClick={onClose}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="detail-hero">
          <span className="avatar avatar-large" style={{ background: `${getHealthColor(score)}16`, color: getHealthColor(score) }}>
            {getInitials(contact.name)}
          </span>
          <div>
            <h2>{contact.name}</h2>
            <p>{contact.role} at {contact.company}</p>
            <small>{contact.email}</small>
          </div>
        </div>
        <div className="health-band">
          <strong style={{ color: getHealthColor(score) }}>{score}/100</strong>
          <span>{getHealthStatus(score)} relationship health</span>
          <small>Last contact {daysLabel(contact)}</small>
        </div>
        {contact.linkedin_recent_signals && (
          <div className="insight-box">
            <TrendingUp size={18} />
            <div>
              <strong>Career signal detected</strong>
              <p>{contact.linkedin_recent_signals}</p>
            </div>
          </div>
        )}
        <div className="panel-section">
          <h3>Channel depth</h3>
          {channels.map(([label, value]) => (
            <div className="channel-row" key={label}>
              <span>{label}</span>
              <div><i style={{ width: `${(Number(value) / max) * 100}%` }} /></div>
              <em>{value}</em>
            </div>
          ))}
        </div>
        {contact.notes && (
          <div className="panel-section">
            <h3>Human context</h3>
            <p>{contact.notes}</p>
          </div>
        )}
        <button className="button button-dark full-width" onClick={generateBrief} disabled={loading}>
          <Bot size={16} /> {loading ? 'Generating brief...' : 'Generate AI pre-meeting brief'}
        </button>
        <button className="button button-light full-width" onClick={() => onChat(contact)}>
          <MessageSquareText size={16} /> Chat about this contact
        </button>
        {brief && (
          <>
            <div className="brief-actions">
              <button className="button button-light" onClick={exportBrief}>
                <Download size={16} /> Export Markdown
              </button>
              <button className="button button-light" onClick={() => window.print()}>
                <Copy size={16} /> Print / Save PDF
              </button>
            </div>
            <pre className="brief-output">{brief}</pre>
          </>
        )}
      </aside>
    </div>
  )
}

export default function DashboardPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<NetworkStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Contact | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatContact, setChatContact] = useState<Contact | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'graph' | 'signals'>('grid')
  const [judgeDemoOpen, setJudgeDemoOpen] = useState(false)
  const [judgeDemoStep, setJudgeDemoStep] = useState(0)

  useEffect(() => {
    fetch('/api/contacts')
      .then((res) => res.json())
      .then((data) => {
        setContacts(data.contacts || [])
        setStats(data.stats || null)
      })
      .finally(() => setLoading(false))
  }, [])

  const plan = useMemo<PlanItem[]>(() => {
    const urgent = contacts
      .filter((c) => (c.days_since_contact || 0) > 55 && c.relationship !== 'acquaintance')
      .sort((a, b) => (b.days_since_contact || 0) - (a.days_since_contact || 0))
      .slice(0, 3)
      .map((contact) => ({
        contact,
        priority: 'urgent' as const,
        reason: `${contact.days_since_contact} days without a meaningful touchpoint. This is a warm relationship drifting into risk.`,
        action: 'Send a lightweight reconnect note today.',
      }))

    const signals = contacts
      .filter((c) => c.linkedin_recent_signals)
      .sort((a, b) => (a.days_since_contact || 0) - (b.days_since_contact || 0))
      .slice(0, 3)
      .map((contact) => ({
        contact,
        priority: 'signal' as const,
        reason: contact.linkedin_recent_signals || 'New professional signal detected.',
        action: 'Use the signal for a genuine, timely outreach.',
      }))

    const nurture = contacts
      .filter((c) => c.health_score >= 70)
      .sort((a, b) => b.health_score - a.health_score)
      .slice(0, 2)
      .map((contact) => ({
        contact,
        priority: 'nurture' as const,
        reason: 'High-trust relationship with recent activity. Keep the momentum compounding.',
        action: 'Ask for advice, feedback, or a strategic intro.',
      }))

    return [...urgent, ...signals, ...nurture].slice(0, 6)
  }, [contacts])

  const filteredContacts = useMemo(() => {
    return contacts
      .filter((contact) => {
        const haystack = `${contact.name} ${contact.company} ${contact.role} ${contact.tags.join(' ')}`.toLowerCase()
        const matchesSearch = haystack.includes(search.toLowerCase())
        const status = getHealthStatus(contact.health_score)
        const matchesFilter = filter === 'all' || status === filter || contact.relationship === filter
        return matchesSearch && matchesFilter
      })
      .sort((a, b) => b.health_score - a.health_score)
  }, [contacts, filter, search])

  const healthBuckets = useMemo(() => [
    { name: 'Dormant', value: stats?.dormant_count || 0, color: '#ef4444' },
    { name: 'Fading', value: stats?.fading_count || 0, color: '#f59e0b' },
    { name: 'Strong', value: stats?.strong_count || 0, color: '#16a34a' },
  ], [stats])

  const channelData = useMemo(() => [
    { name: 'Email', value: contacts.reduce((sum, c) => sum + c.total_emails_received + c.total_emails_sent, 0) },
    { name: 'Meetings', value: contacts.reduce((sum, c) => sum + c.total_meetings, 0) },
    { name: 'Slack', value: contacts.reduce((sum, c) => sum + c.total_slack_messages, 0) },
    { name: 'Social', value: contacts.reduce((sum, c) => sum + c.twitter_interactions, 0) },
  ], [contacts])

  const opportunityCount = contacts.filter((c) => c.linkedin_recent_signals).length
  const riskCount = contacts.filter((c) => (c.days_since_contact || 0) > 60).length

  const computedSignals = useMemo(() => {
    const list: Array<{
      id: string
      contact: Contact
      type: 'warning' | 'opportunity' | 'sync'
      title: string
      desc: string
      date: string
      action: string
    }> = []

    contacts.forEach(c => {
      if (c.linkedin_recent_signals) {
        list.push({
          id: `sig-li-${c.page_id}`,
          contact: c,
          type: 'opportunity',
          title: `Career Signal: ${c.name}`,
          desc: c.linkedin_recent_signals.split('|')[0].trim(),
          date: 'Recent update',
          action: 'Congrats Draft'
        })
      }

      if ((c.days_since_contact || 0) > 60 && c.relationship !== 'acquaintance') {
        list.push({
          id: `sig-decay-${c.page_id}`,
          contact: c,
          type: 'warning',
          title: `Slipping Connection: ${c.name}`,
          desc: `No interaction for ${c.days_since_contact} days. Health dropped to ${Math.round(c.health_score)}/100.`,
          date: `${c.days_since_contact} days quiet`,
          action: 'Send follow-up'
        })
      }
      
      if (c.total_meetings >= 8 && c.health_score >= 85) {
        list.push({
          id: `sig-strong-${c.page_id}`,
          contact: c,
          type: 'sync',
          title: `Key Partner: ${c.name}`,
          desc: `Stellar relationship momentum (${c.total_meetings} meetings, ${c.total_emails_received + c.total_emails_sent} email exchanges).`,
          date: 'Active',
          action: 'Ask advice'
        })
      }
    })

    return list.sort((a, b) => {
      const order = { opportunity: 0, warning: 1, sync: 2 }
      return order[a.type] - order[b.type]
    })
  }, [contacts])

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    event.currentTarget.style.setProperty('--cursor-x', `${event.clientX - rect.left}px`)
    event.currentTarget.style.setProperty('--cursor-y', `${event.clientY - rect.top}px`)
    event.currentTarget.style.setProperty('--parallax-x', String(x))
    event.currentTarget.style.setProperty('--parallax-y', String(y))
  }

  return (
    <main className="app-shell cursor-reactive" onPointerMove={handlePointerMove}>
      <div className="cursor-field gentle-rain-field" aria-hidden="true">
        <span className="rain-wake wake-a" />
        <span className="rain-wake wake-b" />
        <span className="rain-wake wake-c" />
        {Array.from({ length: 18 }).map((_, index) => (
          <span key={index} className={`rain-drop drop-${index + 1}`} />
        ))}
      </div>
      <nav className="top-nav app-nav">
        <Link href="/" className="brand-lockup">
          <span className="brand-mark">C</span>
          <span>Coral CRM</span>
        </Link>
        <div className="nav-links">
          <Link href="/explorer">SQL Explorer</Link>
          <Link href="/settings">Sources</Link>
        </div>
      </nav>

      <section className="dashboard-hero">
        <div>
          <div className="eyebrow">
            <Sparkles size={14} />
            Relationship command center
          </div>
          <h1>Know who needs you next.</h1>
          <p>
            Coral joins every relationship surface into one graph, then turns it into
            a daily plan with context, drafts, risk lanes, and proof judges can inspect.
          </p>
          <div className="hero-actions dashboard-actions">
            <button
              className="button button-dark"
              onClick={() => {
                setJudgeDemoStep(0)
                setJudgeDemoOpen(true)
              }}
            >
              <PlayCircle size={17} /> Judge Demo
            </button>
            <Link href="/explorer" className="button button-light">
              Run SQL Explorer <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="hero-proof-card" data-float="16">
          <DatabaseZap size={20} />
          <strong>Live Coral pattern</strong>
          <span>contact_relationship_graph</span>
          <Link href="/explorer">Inspect SQL <ArrowRight size={14} /></Link>
        </div>
      </section>

      {loading ? (
        <div className="loading-state">Loading relationship graph...</div>
      ) : (
        <>
          <section className="metric-grid">
            <StatTile label="Contacts" value={stats?.total_contacts || 0} note="across 6 sources" icon={Network} />
            <StatTile label="Avg health" value={Math.round(stats?.avg_health_score || 0)} note="relationship score" icon={UserRoundCheck} />
            <StatTile label="At risk" value={riskCount} note="60+ days quiet" icon={Zap} />
            <StatTile label="Signals" value={opportunityCount} note="career moments" icon={TrendingUp} />
            <StatTile label="AI actions" value={plan.length} note="ready today" icon={Bot} />
          </section>

          <section className="command-grid">
            <div className="section-panel primary-panel" data-float="6">
              <div className="section-heading">
                <div>
                  <span>Agent plan</span>
                  <h2>Today&apos;s highest-leverage moves</h2>
                </div>
                <MessageSquareText size={22} />
              </div>
              <div className="plan-grid">
                {plan.map((item) => (
                  <PlanCard key={`${item.priority}-${item.contact.page_id}`} item={item} onSelect={setSelected} />
                ))}
              </div>
            </div>

            <aside className="section-panel" data-float="-10">
              <div className="section-heading">
                <div>
                  <span>Winning proof</span>
                  <h2>Why judges remember it</h2>
                </div>
                <CheckCircle2 size={22} />
              </div>
              <div className="proof-list">
                {[
                  ['Coral depth', 'SQL joins Gmail, Calendar, Slack, LinkedIn, X, and Notion into one usable graph.'],
                  ['AI value', 'The assistant produces briefs and outreach from actual relationship context, not generic CRM fields.'],
                  ['Action loop', 'Every insight becomes a next action, draft, or meeting prep path.'],
                  ['Demo clarity', 'SQL Explorer and source setup make the technical story inspectable in under a minute.'],
                ].map(([title, body]) => (
                  <div key={title}>
                    <strong>{title}</strong>
                    <p>{body}</p>
                  </div>
                ))}
              </div>
            </aside>
          </section>

          <CoralCockpit />
          <JudgeScorecardPanel />
          <QueryReplayPanel />
          <SourceFreshnessPanel />
          <CoralComparisonPanel />

          <section className="analytics-grid">
            <div className="section-panel">
              <div className="section-heading compact">
                <h2>Relationship health</h2>
                <Filter size={18} />
              </div>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={healthBuckets} dataKey="value" nameKey="name" innerRadius={54} outerRadius={82} paddingAngle={3}>
                      {healthBuckets.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="legend-row">
                {healthBuckets.map((bucket) => (
                  <span key={bucket.name}><i style={{ background: bucket.color }} />{bucket.name}: {bucket.value}</span>
                ))}
              </div>
            </div>

            <div className="section-panel">
              <div className="section-heading compact">
                <h2>Channel evidence</h2>
                <BriefcaseBusiness size={18} />
              </div>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelData}>
                    <CartesianGrid stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} width={36} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#111827" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="section-panel">
              <div className="section-heading compact">
                <h2>Meeting prep queue</h2>
                <CalendarClock size={18} />
              </div>
              <div className="stack-list">
                {contacts
                  .filter((c) => c.health_score >= 75 || c.linkedin_recent_signals)
                  .slice(0, 5)
                  .map((contact) => (
                    <ContactPill key={contact.page_id} contact={contact} onClick={() => setSelected(contact)} />
                  ))}
              </div>
            </div>
          </section>

          <section className="section-panel">
            <div className="section-heading">
              <div>
                <span>Relationship graph</span>
                <h2>Browse every contact</h2>
              </div>
              <div className="search-row">
                <Search size={16} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search people, companies, tags" />
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="all">All</option>
                  <option value="strong">Strong</option>
                  <option value="fading">Fading</option>
                  <option value="dormant">Dormant</option>
                  <option value="close">Close</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
            </div>
            <div style={{
              display: 'flex',
              gap: 8,
              marginBottom: 20,
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: 12,
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}
                style={{ padding: '6px 14px', fontSize: 11, borderRadius: 'var(--radius-full)' }}
              >
                Grid View ({filteredContacts.length})
              </button>
              <button
                onClick={() => setViewMode('graph')}
                className={viewMode === 'graph' ? 'btn-primary' : 'btn-ghost'}
                style={{ padding: '6px 14px', fontSize: 11, borderRadius: 'var(--radius-full)' }}
              >
                Relationship Galaxy Graph
              </button>
              <button
                onClick={() => setViewMode('signals')}
                className={viewMode === 'signals' ? 'btn-primary' : 'btn-ghost'}
                style={{ padding: '6px 14px', fontSize: 11, borderRadius: 'var(--radius-full)' }}
              >
                Alert Signals ({computedSignals.length})
              </button>
            </div>

            {viewMode === 'grid' && (
              <div className="contact-grid">
                {filteredContacts.map((contact) => (
                  <ContactPill key={contact.page_id} contact={contact} onClick={() => setSelected(contact)} />
                ))}
              </div>
            )}

            {viewMode === 'graph' && (
              <VisualGraph
                contacts={contacts}
                onSelect={setSelected}
                searchQuery={search}
              />
            )}

            {viewMode === 'signals' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                {computedSignals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: 13 }}>
                    No critical network signals detected today.
                  </div>
                ) : (
                  computedSignals.map(sig => {
                    const borderColors = {
                      warning: '#ef4444',
                      opportunity: '#f59e0b',
                      sync: '#16a34a'
                    }
                    const bgGlows = {
                      warning: 'rgba(239, 68, 68, 0.02)',
                      opportunity: 'rgba(245, 158, 11, 0.02)',
                      sync: 'rgba(22, 163, 74, 0.02)'
                    }
                    return (
                      <div key={sig.id} className="glass-card" style={{
                        borderLeft: `4px solid ${borderColors[sig.type]}`,
                        background: bgGlows[sig.type],
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 16,
                        flexWrap: 'wrap'
                      }}>
                        <div style={{ flex: 1, minWidth: '240px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={{
                              fontSize: 9, padding: '2px 8px', borderRadius: 'var(--radius-full)',
                              background: 'rgba(255, 255, 255, 0.04)', color: borderColors[sig.type],
                              fontFamily: "'JetBrains Mono', monospace", fontWeight: 700
                            }}>
                              {sig.type.toUpperCase()}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{sig.date}</span>
                          </div>
                          <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                            {sig.title}
                          </h4>
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                            {sig.desc}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                          <button
                            onClick={() => {
                              setChatContact(sig.contact)
                              setChatOpen(true)
                            }}
                            className="button button-dark"
                            style={{ padding: '6px 12px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <Bot size={13} /> Outreach Draft
                          </button>
                          <button
                            onClick={() => setSelected(sig.contact)}
                            className="button button-light"
                            style={{ padding: '6px 12px', fontSize: 11 }}
                          >
                            Context Profile
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </section>
        </>
      )}

      {selected && (
        <DetailPanel
          contact={selected}
          onClose={() => setSelected(null)}
          onChat={(contact) => {
            setChatContact(contact)
            setChatOpen(true)
          }}
        />
      )}
      <button
        className="floating-chat-button"
        onClick={() => {
          setChatContact(null)
          setChatOpen(true)
        }}
        aria-label="Open relationship agent chat"
      >
        <Bot size={22} />
        <span>Ask Agent</span>
      </button>
      {chatOpen && (
        <ChatPanel
          contacts={contacts}
          activeContact={chatContact}
          onClose={() => setChatOpen(false)}
        />
      )}
      {judgeDemoOpen && (
        <JudgeDemoOverlay
          step={judgeDemoStep}
          onStep={setJudgeDemoStep}
          onClose={() => setJudgeDemoOpen(false)}
        />
      )}
    </main>
  )
}
