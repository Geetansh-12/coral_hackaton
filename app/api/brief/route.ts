// POST /api/brief — AI pre-meeting brief for a contact
import { NextRequest, NextResponse } from 'next/server'
import { mockContacts, mockGmailThreads, mockCalendarEvents } from '@/lib/mock-data'
import { generateBrief } from '@/lib/anthropic'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 })
  }

  try {
    // In production, parallel Coral queries power the cross-source brief:
    //   const [contact, threads, meetings, linkedin] = await Promise.all([
    //     getContact(email),
    //     getEmailThreads(email, 5),
    //     getUpcomingMeetings(email),
    //     getLinkedinSignals(email),
    //   ])

    const isDemoMode = typeof global.DEMO_MODE !== 'undefined' ? global.DEMO_MODE : process.env.DEMO_MODE !== 'false';

    let contact, threads, meetings;

    if (!isDemoMode) {
      const { getContact, getEmailThreads, getUpcomingMeetings } = require('@/lib/db');
      contact = await getContact(email);
      threads = await getEmailThreads(email, 5);
      meetings = await getUpcomingMeetings(email);
      if (contact && typeof contact.tags === 'string') {
        contact.tags = JSON.parse(contact.tags);
      }
    } else {
      // Demo mode
      contact = mockContacts.find(c => c.email === email)
      threads = mockGmailThreads[email] || []
      meetings = mockCalendarEvents.filter(e =>
        e.attendees.some(a => a.email === email)
      )
    }

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    // Build prompt for Claude
    const systemPrompt = `You are a personal relationship intelligence assistant. Be warm, specific, and concise. Never say "based on the data provided." Speak as if you genuinely know this person's network.`

    const userPrompt = `Generate a pre-meeting brief for ${contact.name} at ${contact.company}.
Context:
- Role: ${contact.role}
- Relationship type: ${contact.relationship}
- Health score: ${contact.health_score}/100
- Days since contact: ${contact.days_since_contact}
- Tags: ${contact.tags.join(', ')}
- Last email subject: ${threads[0]?.subject ?? 'none'}
- Last email snippet: ${threads[0]?.snippet ?? 'none'}
- Upcoming meeting: ${meetings[0]?.title ?? 'none'} at ${meetings[0]?.starts_at ?? 'unknown'}
- Recent LinkedIn: ${contact.linkedin_recent_signals || 'none'}
- Personal notes: ${contact.notes ?? 'none'}

Write a pre-meeting brief with these sections:
**Last interaction** — when and what you talked about last
**What's new with them** — job changes, public activity, recent signals
**Open threads** — anything unresolved or promised
**Suggested talking points** — 3 natural conversation starters
**Relationship pulse** — honest 1-2 sentence assessment

Be specific, warm, and concise. Max 250 words.`

    const brief = await generateBrief(systemPrompt, userPrompt)

    return NextResponse.json({ brief, contact, threads, meetings })
  } catch (err) {
    console.error('Brief generation failed:', err)
    return NextResponse.json(
      { error: 'Brief generation failed' },
      { status: 500 }
    )
  }
}
