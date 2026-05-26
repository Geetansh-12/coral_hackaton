import Database from 'better-sqlite3'
import path from 'path'
import { mockContacts, mockGmailThreads, mockCalendarEvents } from '../lib/mock-data'
import fs from 'fs'

const dbPath = path.resolve(process.cwd(), 'data', 'coral_crm.db')
// ensure dir exists
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath))
}

const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

console.log('Seeding SQLite database at', dbPath)

// Drop existing tables and views
const dropStatements = `
  DROP TABLE IF EXISTS contact_relationship_graph;
  DROP VIEW IF EXISTS contact_relationship_graph;
  DROP TABLE IF EXISTS slack_messages;
  DROP TABLE IF EXISTS linkedin_activity;
  DROP TABLE IF EXISTS twitter_activity;
  DROP TABLE IF EXISTS notion_contacts;
  DROP TABLE IF EXISTS calendar_events;
  DROP TABLE IF EXISTS gmail_threads;
`
db.exec(dropStatements)

// Create tables
const createTables = `
CREATE TABLE gmail_threads (
    thread_id TEXT PRIMARY KEY,
    subject TEXT,
    from_email TEXT,
    from_name TEXT,
    to_emails TEXT,
    cc_emails TEXT,
    snippet TEXT,
    body_text TEXT,
    labels TEXT,
    sent_at DATETIME,
    is_sent BOOLEAN,
    thread_length INTEGER,
    has_attachment BOOLEAN
);

CREATE TABLE calendar_events (
    event_id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    location TEXT,
    organizer_email TEXT,
    attendees TEXT, -- JSON array
    starts_at DATETIME,
    ends_at DATETIME,
    duration_mins INTEGER,
    is_recurring BOOLEAN,
    video_link TEXT,
    status TEXT
);

CREATE TABLE notion_contacts (
    page_id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    company TEXT,
    role TEXT,
    github_username TEXT,
    tags TEXT, -- JSON array
    relationship TEXT,
    notes TEXT,
    custom_fields TEXT -- JSON object
);

CREATE TABLE twitter_activity (
    tweet_id TEXT PRIMARY KEY,
    author_handle TEXT,
    author_name TEXT,
    author_email TEXT,
    content TEXT,
    is_reply BOOLEAN,
    is_mention BOOLEAN,
    is_dm BOOLEAN,
    likes INTEGER,
    retweets INTEGER,
    created_at DATETIME
);

CREATE TABLE linkedin_activity (
    id TEXT PRIMARY KEY,
    contact_name TEXT,
    contact_email TEXT,
    event_type TEXT,
    detail TEXT,
    company TEXT,
    role TEXT,
    occurred_at DATETIME
);

CREATE TABLE slack_messages (
    message_id TEXT PRIMARY KEY,
    channel_id TEXT,
    channel_name TEXT,
    sender_email TEXT,
    sender_name TEXT,
    content TEXT,
    is_dm BOOLEAN,
    thread_ts TEXT,
    created_at DATETIME
);
`
db.exec(createTables)

// Seed notion_contacts (acts as the base registry)
const insertNotion = db.prepare(`
  INSERT INTO notion_contacts (page_id, name, email, company, role, github_username, tags, relationship, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

mockContacts.forEach(c => {
  insertNotion.run(
    c.page_id,
    c.name,
    c.email,
    c.company,
    c.role,
    c.github_username || null,
    JSON.stringify(c.tags || []),
    c.relationship,
    c.notes
  )
})

// Seed gmail_threads
const insertGmail = db.prepare(`
  INSERT INTO gmail_threads (thread_id, subject, from_email, from_name, snippet, sent_at, is_sent, thread_length)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`)

Object.entries(mockGmailThreads).forEach(([email, threads]) => {
  threads.forEach(t => {
    insertGmail.run(
      t.thread_id,
      t.subject,
      t.from_email || email,
      t.from_name,
      t.snippet,
      t.sent_at,
      t.is_sent ? 1 : 0,
      t.thread_length
    )
  })
})

// Seed calendar_events
const insertCalendar = db.prepare(`
  INSERT INTO calendar_events (event_id, title, attendees, starts_at, ends_at, duration_mins)
  VALUES (?, ?, ?, ?, ?, ?)
`)

mockCalendarEvents.forEach(e => {
  insertCalendar.run(
    e.event_id,
    e.title,
    JSON.stringify(e.attendees),
    e.starts_at,
    e.ends_at,
    e.duration_mins
  )
})

// Seed LinkedIn signals
const insertLinkedin = db.prepare(`
  INSERT INTO linkedin_activity (id, contact_email, event_type, detail, occurred_at)
  VALUES (?, ?, ?, ?, ?)
`)
mockContacts.forEach((c, idx) => {
  if (c.linkedin_recent_signals) {
    insertLinkedin.run(
      `li-${idx}`,
      c.email,
      'update',
      c.linkedin_recent_signals,
      new Date().toISOString()
    )
  }
})

// Create the cross-source Materialized View equivalent in SQLite
// Since SQLite doesn't have Materialized Views, we just create a View that performs the JOIN
// We simulate the complex health_score logic with some SQLite math
const createView = `
CREATE VIEW contact_relationship_graph AS
WITH aggregated_stats AS (
    SELECT 
        n.email,
        COUNT(DISTINCT g.thread_id) as total_emails,
        COUNT(DISTINCT c.event_id) as total_meetings,
        COUNT(DISTINCT l.id) as total_linkedin
    FROM notion_contacts n
    LEFT JOIN gmail_threads g ON g.from_email = n.email OR g.to_emails LIKE '%' || n.email || '%'
    LEFT JOIN calendar_events c ON c.attendees LIKE '%' || n.email || '%'
    LEFT JOIN linkedin_activity l ON l.contact_email = n.email
    GROUP BY n.email
)
SELECT 
    n.page_id,
    n.name,
    n.email,
    n.company,
    n.role,
    n.tags,
    n.relationship,
    n.notes,
    -- Hardcode the health score from mock data for consistency during demo, 
    -- but this proves the view can SELECT it
    ? as last_contact_at, 
    ? as days_since_contact,
    ? as health_score,
    COALESCE(a.total_emails, 0) as total_emails_received,
    COALESCE(a.total_emails, 0) as total_emails_sent,
    COALESCE(a.total_meetings, 0) as total_meetings,
    COALESCE(a.total_linkedin, 0) as linkedin_interactions,
    0 as total_slack_messages,
    0 as twitter_interactions,
    (SELECT detail FROM linkedin_activity WHERE contact_email = n.email LIMIT 1) as linkedin_recent_signals
FROM notion_contacts n
LEFT JOIN aggregated_stats a ON n.email = a.email;
`
// Wait, we need the exact schema to match `Contact` type.
// But we need the values to be dynamic per row if we do a view, or we can just create a real table for the graph and populate it.
db.exec('DROP TABLE IF EXISTS contact_relationship_graph;')

// Let's create a real table instead of a view to hold the precomputed graph (which is what a Materialized View is anyway)
db.exec(`
CREATE TABLE contact_relationship_graph (
    page_id TEXT,
    name TEXT,
    email TEXT,
    company TEXT,
    role TEXT,
    github_username TEXT,
    tags TEXT,
    relationship TEXT,
    notes TEXT,
    last_contact_at TEXT,
    days_since_contact INTEGER,
    health_score REAL,
    total_emails_received INTEGER,
    total_emails_sent INTEGER,
    total_meetings INTEGER,
    linkedin_interactions INTEGER,
    total_slack_messages INTEGER,
    twitter_interactions INTEGER,
    linkedin_recent_signals TEXT
);
`)

const insertGraph = db.prepare(`
  INSERT INTO contact_relationship_graph (
    page_id, name, email, company, role, github_username, tags, relationship, notes,
    last_contact_at, days_since_contact, health_score,
    total_emails_received, total_emails_sent, total_meetings,
    linkedin_interactions, total_slack_messages, twitter_interactions, linkedin_recent_signals
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

mockContacts.forEach(c => {
  insertGraph.run(
    c.page_id, c.name, c.email, c.company, c.role, c.github_username || null, JSON.stringify(c.tags || []),
    c.relationship, c.notes, c.last_contact_at, c.days_since_contact, c.health_score,
    c.total_emails_received, c.total_emails_sent, c.total_meetings,
    0, c.total_slack_messages, c.twitter_interactions, c.linkedin_recent_signals
  )
})

console.log('✅ Seeding complete!')
