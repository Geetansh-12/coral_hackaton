// GET /api/contacts — all contacts + network stats for dashboard
import { NextResponse } from 'next/server'
import { mockContacts, getMockNetworkStats } from '@/lib/mock-data'

export async function GET() {
  try {
    // In production, these come from Coral SQL cross-source joins:
    //   const [contacts, stats] = await Promise.all([
    //     getAllContacts(),    // SELECT * FROM contact_relationship_graph
    //     getNetworkStats(),  // Aggregated health stats
    //   ])

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
