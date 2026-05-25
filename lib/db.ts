import Database from 'better-sqlite3'
import path from 'path'
import { Contact, NetworkStats, GmailThread, CalendarEvent, LinkedInSignal } from '@/lib/types'

let db: Database.Database | null = null

function getDb() {
  if (!db) {
    const dbPath = path.resolve(process.cwd(), 'data', 'coral_crm.db')
    try {
      db = new Database(dbPath, { readonly: false, fileMustExist: false })
      db.pragma('journal_mode = WAL')
    } catch (e) {
      console.warn('[DB] Could not open SQLite database:', e)
      return null
    }
  }
  return db
}

// Low-level query execution (mimics Coral SQL endpoint)
export function queryDb<T = any>(sql: string, params: any[] = []): T[] {
  const conn = getDb()
  if (!conn) return []
  
  try {
    // Basic conversion for parameterized queries (from PostgreSQL $1, $2 to SQLite ?, ?)
    let sqliteSql = sql
    for (let i = 1; i <= 10; i++) {
      sqliteSql = sqliteSql.replaceAll(`$${i}`, '?')
    }
    
    // Some Coral SQL pattern matching fixes for SQLite
    sqliteSql = sqliteSql.replace(/ILIKE/gi, 'LIKE')

    const stmt = conn.prepare(sqliteSql)
    return stmt.all(...params) as T[]
  } catch (error) {
    console.error('[DB] Query error:', error)
    return []
  }
}

// Higher level API functions matching lib/coral.ts structure
export async function getAllContacts(): Promise<Contact[]> {
  return queryDb<Contact>('SELECT * FROM contact_relationship_graph ORDER BY health_score DESC')
}

export async function getContact(email: string): Promise<Contact | null> {
  const rows = queryDb<Contact>('SELECT * FROM contact_relationship_graph WHERE email = $1 LIMIT 1', [email])
  return rows[0] || null
}

export async function getFadingContacts(days: number = 60): Promise<Contact[]> {
  return queryDb<Contact>(
    `SELECT * FROM contact_relationship_graph 
     WHERE days_since_contact > $1 AND relationship IN ('close', 'professional')
     ORDER BY days_since_contact DESC LIMIT 10`,
    [days]
  )
}

export async function getEmailThreads(email: string, limit: number = 5): Promise<GmailThread[]> {
  return queryDb<GmailThread>(
    `SELECT * FROM gmail_threads 
     WHERE from_email = $1 OR to_email = $1 OR cc_emails LIKE '%' || $1 || '%'
     ORDER BY sent_at DESC LIMIT $2`,
    [email, limit]
  )
}

export async function getUpcomingMeetings(email: string): Promise<CalendarEvent[]> {
  // SQLite JSON querying is different, simplified here for the hackathon
  return queryDb<CalendarEvent>(
    `SELECT * FROM calendar_events 
     WHERE attendees LIKE '%' || $1 || '%' AND starts_at > datetime('now')
     ORDER BY starts_at ASC LIMIT 5`,
    [email]
  )
}

export async function getNetworkStats(): Promise<NetworkStats> {
  const rows = queryDb<any>(`
    SELECT 
      COUNT(*) as total_contacts,
      SUM(CASE WHEN health_score >= 70 THEN 1 ELSE 0 END) as strong_count,
      SUM(CASE WHEN health_score >= 40 AND health_score < 70 THEN 1 ELSE 0 END) as fading_count,
      SUM(CASE WHEN health_score < 40 THEN 1 ELSE 0 END) as dormant_count,
      AVG(health_score) as avg_health_score
    FROM contact_relationship_graph
  `)
  return {
    total_contacts: Number(rows[0]?.total_contacts || 0),
    strong_count: Number(rows[0]?.strong_count || 0),
    fading_count: Number(rows[0]?.fading_count || 0),
    dormant_count: Number(rows[0]?.dormant_count || 0),
    avg_health_score: Number(rows[0]?.avg_health_score || 0)
  }
}

export async function getLinkedinSignals(email: string): Promise<LinkedInSignal[]> {
  return queryDb<LinkedInSignal>(
    `SELECT * FROM linkedin_activity 
     WHERE contact_email = $1 
     ORDER BY occurred_at DESC LIMIT 5`,
    [email]
  )
}
