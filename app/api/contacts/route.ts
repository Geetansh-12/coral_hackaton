// GET /api/contacts — all contacts + network stats for dashboard
import { NextResponse } from 'next/server'
import { mockContacts, getMockNetworkStats } from '@/lib/mock-data'
import { getAllContacts, getNetworkStats } from '@/lib/db'

export async function GET() {
  try {
    const isDemoMode = typeof global.DEMO_MODE !== 'undefined' ? global.DEMO_MODE : process.env.DEMO_MODE !== 'false';

    if (!isDemoMode) {
      const contacts = await getAllContacts()
      const stats = await getNetworkStats()
      // parse tags if they come back as strings from sqlite
      const parsedContacts = contacts.map(c => ({
        ...c,
        tags: typeof c.tags === 'string' ? JSON.parse(c.tags) : c.tags
      }))
      return NextResponse.json({ contacts: parsedContacts, stats })
    }

    // Demo mode — use mock data
    const contacts = mockContacts
    const stats = getMockNetworkStats()

    return NextResponse.json({ contacts, stats })
  } catch (err) {
    console.error('Failed to fetch contacts:', err)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}
