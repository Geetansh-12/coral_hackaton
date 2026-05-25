-- ============================================================
-- RELATIONSHIP CRM FOR HUMANS — CORAL SQL SCHEMAS
-- ============================================================
-- These schemas define how Coral ingests and joins data across
-- Gmail, Google Calendar, Notion, Twitter/X, LinkedIn, and Slack.
-- Coral's schema learning handles dynamic fields automatically.
-- ============================================================


-- ------------------------------------------------------------
-- SOURCE TABLE: gmail_threads
-- Coral ingests via Gmail MCP connector
-- Schema learning ON — Coral adapts to label/header changes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gmail_threads (
  thread_id       TEXT PRIMARY KEY,
  subject         TEXT,
  from_email      TEXT,
  from_name       TEXT,
  to_emails       TEXT[],
  cc_emails       TEXT[],
  snippet         TEXT,
  body_plain      TEXT,
  labels          TEXT[],
  sent_at         TIMESTAMPTZ,
  is_sent         BOOLEAN,
  thread_length   INTEGER,
  has_attachment  BOOLEAN,
  ingested_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gmail_from ON gmail_threads(from_email);
CREATE INDEX IF NOT EXISTS idx_gmail_sent ON gmail_threads(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_gmail_to ON gmail_threads USING GIN(to_emails);


-- ------------------------------------------------------------
-- SOURCE TABLE: calendar_events
-- Coral ingests via Google Calendar MCP connector
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS calendar_events (
  event_id        TEXT PRIMARY KEY,
  title           TEXT,
  description     TEXT,
  location        TEXT,
  organizer_email TEXT,
  attendees       JSONB,
  starts_at       TIMESTAMPTZ,
  ends_at         TIMESTAMPTZ,
  duration_mins   INTEGER,
  is_recurring    BOOLEAN,
  recurrence_rule TEXT,
  video_link      TEXT,
  status          TEXT,
  calendar_id     TEXT,
  ingested_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cal_starts ON calendar_events(starts_at DESC);
CREATE INDEX IF NOT EXISTS idx_cal_attendees ON calendar_events USING GIN(attendees);


-- ------------------------------------------------------------
-- SOURCE TABLE: notion_contacts
-- Coral ingests via Notion API connector
-- Schema learning ON — handles custom Notion DB properties
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notion_contacts (
  page_id         TEXT PRIMARY KEY,
  name            TEXT,
  email           TEXT,
  company         TEXT,
  role            TEXT,
  tags            TEXT[],
  relationship    TEXT,
  notes           TEXT,
  last_synced_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ,
  custom_fields   JSONB,
  ingested_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notion_email ON notion_contacts(email);
CREATE INDEX IF NOT EXISTS idx_notion_tags ON notion_contacts USING GIN(tags);


-- ------------------------------------------------------------
-- SOURCE TABLE: twitter_activity
-- Coral ingests via Twitter/X API connector
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS twitter_activity (
  tweet_id        TEXT PRIMARY KEY,
  author_handle   TEXT,
  author_name     TEXT,
  author_email    TEXT,
  content         TEXT,
  is_reply_to_you BOOLEAN,
  is_mention      BOOLEAN,
  is_dm           BOOLEAN,
  likes           INTEGER,
  retweets        INTEGER,
  replies         INTEGER,
  posted_at       TIMESTAMPTZ,
  ingested_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_twitter_handle ON twitter_activity(author_handle);
CREATE INDEX IF NOT EXISTS idx_twitter_posted ON twitter_activity(posted_at DESC);


-- ------------------------------------------------------------
-- SOURCE TABLE: linkedin_activity
-- Coral ingests from LinkedIn export CSV / API
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS linkedin_activity (
  id              TEXT PRIMARY KEY,
  contact_name    TEXT,
  contact_email   TEXT,
  event_type      TEXT,
  detail          TEXT,
  company         TEXT,
  role            TEXT,
  occurred_at     TIMESTAMPTZ,
  ingested_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_li_email ON linkedin_activity(contact_email);
CREATE INDEX IF NOT EXISTS idx_li_type ON linkedin_activity(event_type);


-- ------------------------------------------------------------
-- SOURCE TABLE: slack_messages
-- Coral ingests via Slack MCP connector
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS slack_messages (
  message_id      TEXT PRIMARY KEY,
  channel_id      TEXT,
  channel_name    TEXT,
  sender_email    TEXT,
  sender_name     TEXT,
  content         TEXT,
  is_dm           BOOLEAN,
  thread_ts       TEXT,
  sent_at         TIMESTAMPTZ,
  ingested_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_slack_sender ON slack_messages(sender_email);
CREATE INDEX IF NOT EXISTS idx_slack_sent ON slack_messages(sent_at DESC);


-- ============================================================
-- MATERIALIZED VIEW: contact_relationship_graph
-- THE CORE — Coral's cross-source join magic
-- Cached nightly, refreshed on demand
-- ============================================================
CREATE MATERIALIZED VIEW contact_relationship_graph AS

WITH
contacts AS (
  SELECT page_id, name, email, company, role, tags, relationship, notes
  FROM notion_contacts
  WHERE email IS NOT NULL
),
email_stats AS (
  SELECT
    from_email AS email,
    MAX(sent_at) AS last_email_received,
    COUNT(*) AS total_emails_received,
    COUNT(*) FILTER (WHERE is_sent) AS total_emails_sent
  FROM gmail_threads
  GROUP BY from_email
),
calendar_stats AS (
  SELECT
    attendee->>'email' AS email,
    MAX(starts_at) AS last_meeting,
    COUNT(*) AS total_meetings
  FROM calendar_events,
    LATERAL jsonb_array_elements(attendees) AS attendee
  WHERE starts_at < NOW()
  GROUP BY attendee->>'email'
),
slack_stats AS (
  SELECT
    sender_email AS email,
    MAX(sent_at) AS last_slack,
    COUNT(*) AS total_slack_messages
  FROM slack_messages
  WHERE is_dm = true
  GROUP BY sender_email
),
twitter_stats AS (
  SELECT
    author_email AS email,
    MAX(posted_at) AS last_twitter_interaction,
    COUNT(*) AS twitter_interactions
  FROM twitter_activity
  WHERE author_email IS NOT NULL
  GROUP BY author_email
),
linkedin_stats AS (
  SELECT
    contact_email AS email,
    MAX(occurred_at) AS last_linkedin_signal,
    STRING_AGG(detail, ' | ') AS recent_signals
  FROM linkedin_activity
  GROUP BY contact_email
)

SELECT
  c.page_id, c.name, c.email, c.company, c.role, c.tags, c.relationship, c.notes,
  GREATEST(e.last_email_received, cal.last_meeting, s.last_slack, t.last_twitter_interaction, l.last_linkedin_signal) AS last_contact_at,
  EXTRACT(DAY FROM NOW() - GREATEST(e.last_email_received, cal.last_meeting, s.last_slack, t.last_twitter_interaction, l.last_linkedin_signal)) AS days_since_contact,
  e.last_email_received, e.total_emails_received, e.total_emails_sent,
  cal.last_meeting, cal.total_meetings,
  s.last_slack, s.total_slack_messages,
  t.last_twitter_interaction, t.twitter_interactions,
  l.last_linkedin_signal, l.recent_signals AS linkedin_recent_signals,
  LEAST(100, GREATEST(0,
    60 * GREATEST(0, 1 - (EXTRACT(DAY FROM NOW() - GREATEST(e.last_email_received, cal.last_meeting, s.last_slack, t.last_twitter_interaction, l.last_linkedin_signal)) / 180.0)) +
    40 * LEAST(1, (COALESCE(e.total_emails_received, 0) + COALESCE(e.total_emails_sent, 0) + COALESCE(cal.total_meetings, 0) + COALESCE(s.total_slack_messages, 0) + COALESCE(t.twitter_interactions, 0)) / 50.0)
  )) AS health_score
FROM contacts c
LEFT JOIN email_stats e ON c.email = e.email
LEFT JOIN calendar_stats cal ON c.email = cal.email
LEFT JOIN slack_stats s ON c.email = s.email
LEFT JOIN twitter_stats t ON c.email = t.email
LEFT JOIN linkedin_stats l ON c.email = l.email;

CREATE INDEX IF NOT EXISTS idx_crg_email ON contact_relationship_graph(email);
CREATE INDEX IF NOT EXISTS idx_crg_health ON contact_relationship_graph(health_score);
CREATE INDEX IF NOT EXISTS idx_crg_last_contact ON contact_relationship_graph(last_contact_at DESC);
