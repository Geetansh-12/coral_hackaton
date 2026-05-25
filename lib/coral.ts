// ============================================================
// Coral SQL Client — all data queries go through here
// Uses Coral's SQL interface for cross-source joins
// Falls back to mock data when DEMO_MODE=true
// ============================================================

import type { Contact, GmailThread, CalendarEvent, NetworkStats, LinkedInSignal } from './types'

const CORAL_URL = process.env.CORAL_API_URL || ''
const CORAL_KEY = process.env.CORAL_API_KEY || ''
const IS_DEMO = process.env.DEMO_MODE === 'true' || !CORAL_URL

// ---------- Coral SQL query engine ----------

async function coralQuery<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  if (IS_DEMO) {
    // In demo mode, we use mock data instead
    throw new Error('DEMO_MODE: Use mock data')
  }

  const res = await fetch(`${CORAL_URL}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CORAL_KEY}`,
    },
    body: JSON.stringify({ sql, params }),
    // Coral caching — queries are cached automatically
    next: { revalidate: 300 }, // 5 min cache
  })

  if (!res.ok) {
    throw new Error(`Coral query failed: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  return data.rows as T[]
}

// ---------- Query functions ----------

/** Get all contacts from the materialized contact_relationship_graph view */
export async function getAllContacts(): Promise<Contact[]> {
  return coralQuery<Contact>(`
    SELECT * FROM contact_relationship_graph
    ORDER BY health_score DESC, last_contact_at DESC NULLS LAST
  `)
}

/** Get a single contact's full profile via cross-source join */
export async function getContact(email: string): Promise<Contact | null> {
  const rows = await coralQuery<Contact>(
    `SELECT * FROM contact_relationship_graph WHERE email = $1`,
    [email]
  )
  return rows[0] ?? null
}

/** Get fading contacts for daily digest (configurable threshold) */
export async function getFadingContacts(days = 60): Promise<Contact[]> {
  return coralQuery<Contact>(`
    SELECT * FROM contact_relationship_graph
    WHERE days_since_contact > $1
      AND relationship IN ('close', 'professional')
    ORDER BY health_score DESC, days_since_contact DESC
    LIMIT 10
  `, [days])
}

/** Get recent email threads for a contact from Gmail source */
export async function getEmailThreads(email: string, limit = 5): Promise<GmailThread[]> {
  return coralQuery<GmailThread>(`
    SELECT thread_id, subject, from_email, from_name, snippet, sent_at, is_sent, thread_length
    FROM gmail_threads
    WHERE from_email = $1 OR $1 = ANY(to_emails)
    ORDER BY sent_at DESC
    LIMIT $2
  `, [email, limit])
}

/** Get upcoming calendar events with a contact */
export async function getUpcomingMeetings(email: string): Promise<CalendarEvent[]> {
  return coralQuery<CalendarEvent>(`
    SELECT event_id, title, starts_at, ends_at, duration_mins, attendees, video_link
    FROM calendar_events
    WHERE attendees @> jsonb_build_array(jsonb_build_object('email', $1))
      AND starts_at > NOW()
    ORDER BY starts_at ASC
    LIMIT 3
  `, [email])
}

/** Get network health stats — powers the dashboard overview */
export async function getNetworkStats(): Promise<NetworkStats> {
  const rows = await coralQuery<{
    total_contacts: string
    strong_count: string
    fading_count: string
    dormant_count: string
    avg_health_score: string
  }>(`
    SELECT
      COUNT(*)                                                          AS total_contacts,
      COUNT(*) FILTER (WHERE health_score >= 70)                        AS strong_count,
      COUNT(*) FILTER (WHERE health_score >= 40 AND health_score < 70)  AS fading_count,
      COUNT(*) FILTER (WHERE health_score < 40)                         AS dormant_count,
      ROUND(AVG(health_score)::numeric, 1)                              AS avg_health_score
    FROM contact_relationship_graph
  `)

  const r = rows[0]
  return {
    total_contacts: parseInt(r.total_contacts),
    strong_count: parseInt(r.strong_count),
    fading_count: parseInt(r.fading_count),
    dormant_count: parseInt(r.dormant_count),
    avg_health_score: parseFloat(r.avg_health_score),
  }
}

/** Get recent LinkedIn signals (job changes etc.) for a contact */
export async function getLinkedinSignals(email: string): Promise<LinkedInSignal[]> {
  return coralQuery<LinkedInSignal>(`
    SELECT detail, event_type, occurred_at, company, role
    FROM linkedin_activity
    WHERE contact_email = $1
    ORDER BY occurred_at DESC
    LIMIT 5
  `, [email])
}

/** Get today's meetings for the daily digest */
export async function getTodaysMeetings(): Promise<CalendarEvent[]> {
  return coralQuery<CalendarEvent>(`
    SELECT event_id, title, starts_at, ends_at, duration_mins, attendees, video_link
    FROM calendar_events
    WHERE DATE(starts_at) = CURRENT_DATE
      AND status = 'confirmed'
    ORDER BY starts_at ASC
  `)
}

/** Refresh the materialized view (on-demand cache refresh) */
export async function refreshContactGraph(): Promise<void> {
  await coralQuery(`REFRESH MATERIALIZED VIEW contact_relationship_graph`)
}
