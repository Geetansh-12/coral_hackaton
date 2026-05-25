'use client'

import Link from 'next/link'
import type { PointerEvent } from 'react'
import {
  ArrowRight,
  Brain,
  CalendarClock,
  CheckCircle2,
  DatabaseZap,
  Layers3,
  MessageSquareText,
  Network,
  Sparkles,
} from 'lucide-react'

const sources = ['Gmail', 'Calendar', 'Slack', 'LinkedIn', 'X', 'Notion']

const proof = [
  'Cross-source SQL graph across 6 relationship surfaces',
  'AI briefs with contact history, signals, and suggested next moves',
  'Daily priority queue for fading, strategic, and high-signal contacts',
]

export default function LandingPage() {
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
    <main className="site-shell antigravity-bg cursor-reactive" onPointerMove={handlePointerMove}>
      <div className="cursor-field gentle-rain-field" aria-hidden="true">
        <span className="rain-wake wake-a" />
        <span className="rain-wake wake-b" />
        <span className="rain-wake wake-c" />
        {Array.from({ length: 18 }).map((_, index) => (
          <span key={index} className={`rain-drop drop-${index + 1}`} />
        ))}
      </div>
      <div className="gravity-rail rail-one" data-float="28" aria-hidden="true" />
      <div className="gravity-rail rail-two" data-float="-18" aria-hidden="true" />
      <nav className="top-nav">
        <Link href="/" className="brand-lockup" aria-label="Coral CRM home">
          <span className="brand-mark">C</span>
          <span>Coral CRM</span>
        </Link>
        <div className="nav-links">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/explorer">SQL Explorer</Link>
          <Link href="/settings">Sources</Link>
        </div>
        <Link href="/dashboard" className="button button-dark">
          Launch app <ArrowRight size={16} />
        </Link>
      </nav>

      <section className="hero-grid">
        <div className="hero-copy" data-float="-10">
          <div className="eyebrow">
            <Sparkles size={14} />
            WeMakeDevs hackathon build
          </div>
          <h1>Coral CRM</h1>
          <p className="hero-subtitle">
            Relationship intelligence for builders who need the right person, the right context,
            and the right follow-up before the opportunity gets cold.
          </p>
          <div className="hero-actions">
            <Link href="/dashboard" className="button button-dark button-large">
              Open command center <ArrowRight size={18} />
            </Link>
            <Link href="/explorer" className="button button-light button-large">
              Show Coral SQL
            </Link>
          </div>
          <div className="source-strip" aria-label="Connected sources" data-float="8">
            {sources.map((source) => (
              <span key={source}>{source}</span>
            ))}
          </div>
        </div>

        <div className="workspace-preview" aria-label="Relationship intelligence preview" data-float="18">
          <div className="preview-toolbar">
            <span />
            <span />
            <span />
            <strong>agent-manager.crm</strong>
          </div>
          <div className="preview-body">
            <div className="agent-column">
              <div className="agent-card active" data-float="8">
                <Network size={18} />
                <div>
                  <strong>Relationship Graph</strong>
                  <span>34 contacts, 6 sources joined</span>
                </div>
              </div>
              <div className="agent-card" data-float="13">
                <CalendarClock size={18} />
                <div>
                  <strong>Meeting Prep</strong>
                  <span>3 briefs ready</span>
                </div>
              </div>
              <div className="agent-card" data-float="18">
                <MessageSquareText size={18} />
                <div>
                  <strong>Outreach Agent</strong>
                  <span>5 warm drafts queued</span>
                </div>
              </div>
            </div>
            <div className="artifact-panel" data-float="-12">
              <div className="artifact-header">
                <Brain size={18} />
                <span>Today&apos;s plan</span>
              </div>
              {[
                ['Rachel Kim', 'Investor relationship at risk', 'Send funding thesis follow-up'],
                ['Alex Kim', 'New Anthropic role detected', 'Congratulate and ask for coffee'],
                ['Maya Johnson', 'Design-system signal', 'Share prototype and ask for critique'],
              ].map(([name, signal, action]) => (
                <div className="artifact-row" key={name}>
                  <div>
                    <strong>{name}</strong>
                    <span>{signal}</span>
                  </div>
                  <em>{action}</em>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="case-grid" aria-label="Winning product proof">
        <div className="case-card case-card-dark" data-float="10">
          <DatabaseZap size={22} />
          <h2>Built on Coral, not a static CRM demo</h2>
          <p>
            The app exposes the exact SQL pattern judges care about: a materialized
            relationship graph assembled from email, meetings, chat, social, and notes.
          </p>
        </div>
        <div className="case-card" data-float="-8">
          <Layers3 size={22} />
          <h2>Agent-first workflow</h2>
          <p>
            Users do not just browse contacts. They get a ranked daily plan, risk lanes,
            career-signal opportunities, and AI-generated meeting context.
          </p>
        </div>
        <div className="case-card" data-float="14">
          <CheckCircle2 size={22} />
          <h2>Judge-ready storytelling</h2>
          <ul>
            {proof.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
