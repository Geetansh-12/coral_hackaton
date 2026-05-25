// ============================================================
// Coral SQL Engine Types
// All interfaces match the SQL schema exactly
// ============================================================

export interface Contact {
  page_id: string
  name: string
  email: string
  company: string | null
  role: string | null
  tags: string[]
  relationship: 'close' | 'professional' | 'acquaintance' | null
  notes: string | null
  last_contact_at: string | null
  days_since_contact: number | null
  health_score: number
  // Channel breakdown
  last_email_received: string | null
  total_emails_received: number
  total_emails_sent: number
  last_meeting: string | null
  total_meetings: number
  last_slack: string | null
  total_slack_messages: number
  last_twitter_interaction: string | null
  twitter_interactions: number
  last_linkedin_signal: string | null
  linkedin_recent_signals: string | null
}

export interface GmailThread {
  thread_id: string
  subject: string
  from_email: string
  from_name: string
  snippet: string
  sent_at: string
  is_sent: boolean
  thread_length: number
}

export interface CalendarEvent {
  event_id: string
  title: string
  starts_at: string
  ends_at: string
  duration_mins: number
  attendees: { email: string; name: string; response_status: string }[]
  video_link: string | null
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export interface NetworkStats {
  total_contacts: number
  strong_count: number    // health >= 70
  fading_count: number    // health 40-70
  dormant_count: number   // health < 40
  avg_health_score: number
}

export interface LinkedInSignal {
  detail: string
  event_type: string
  occurred_at: string
  company: string
  role: string
}

export type RelationshipType = 'close' | 'professional' | 'acquaintance'
export type HealthStatus = 'strong' | 'fading' | 'dormant'

export function getHealthStatus(score: number): HealthStatus {
  if (score >= 70) return 'strong'
  if (score >= 40) return 'fading'
  return 'dormant'
}

export function getHealthColor(score: number): string {
  if (score >= 70) return '#4ade80'
  if (score >= 40) return '#facc15'
  return '#f87171'
}
