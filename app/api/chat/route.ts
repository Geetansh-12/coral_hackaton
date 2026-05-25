// POST /api/chat — streaming chat with the relationship agent
import { NextRequest } from 'next/server'
import { streamChat } from '@/lib/anthropic'
import { mockContacts } from '@/lib/mock-data'

const SYSTEM_PROMPT = `You are a personal relationship intelligence assistant.
You help the user understand and maintain their professional and personal relationships.
You have access to data from Gmail, Google Calendar, Notion, Twitter/X, LinkedIn, and Slack — all joined via Coral's SQL layer.

Be warm, specific, and human. Never say "based on the data provided."
Speak as if you genuinely know their network — because you do.
Use real names, real dates, real context. Be concise.
Keep responses under 300 words.`

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function editDistance(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
    }
  }
  return dp[a.length][b.length]
}

function resolveContact(contactEmail: string | undefined, messages: { content: string }[]) {
  if (contactEmail) {
    const byEmail = mockContacts.find(c => c.email === contactEmail)
    if (byEmail) return byEmail
  }

  const latest = normalize(messages[messages.length - 1]?.content || '')
  if (!latest) return null

  return mockContacts.find(contact => {
    const name = normalize(contact.name)
    const company = normalize(contact.company || '')
    const role = normalize(contact.role || '')
    const parts = name.split(' ')
    const firstName = parts[0]
    const lastName = parts[parts.length - 1]
    const latestWords = latest.split(' ')
    const fuzzyLast = lastName && latestWords.some(word => editDistance(word, lastName) <= 2)

    return latest.includes(name)
      || Boolean(firstName && lastName && latest.includes(firstName) && latest.includes(lastName))
      || Boolean(firstName && latest.includes(firstName) && fuzzyLast)
      || Boolean(company && latest.includes(company))
      || Boolean(role && firstName && latest.includes(role) && latest.includes(firstName))
  }) || null
}

export async function POST(req: NextRequest) {
  const { messages, contactEmail } = await req.json()

  // If talking about a specific contact, inject their data from Coral
  let contextPrompt = SYSTEM_PROMPT
  const contact = resolveContact(contactEmail, messages)
  if (contact) {
    contextPrompt += `\n\nCurrent contact context:
Name: ${contact.name}
Company: ${contact.company}
Role: ${contact.role}
Relationship: ${contact.relationship}
Health score: ${contact.health_score}/100
Days since contact: ${contact.days_since_contact}
Tags: ${contact.tags.join(', ')}
Notes: ${contact.notes}
LinkedIn signals: ${contact.linkedin_recent_signals || 'none'}`
  }

  // Inject network overview for general questions
  const strong = mockContacts.filter(c => c.health_score >= 70)
  const fading = mockContacts.filter(c => c.health_score >= 40 && c.health_score < 70)
  const dormant = mockContacts.filter(c => c.health_score < 40)

  contextPrompt += `\n\nNetwork overview:
Total contacts: ${mockContacts.length}
Strong (70+): ${strong.length} — ${strong.slice(0, 5).map(c => c.name).join(', ')}
Fading (40-70): ${fading.length} — ${fading.slice(0, 5).map(c => c.name).join(', ')}
Dormant (<40): ${dormant.length} — ${dormant.slice(0, 5).map(c => c.name).join(', ')}

Recent LinkedIn signals:
${mockContacts.filter(c => c.linkedin_recent_signals).map(c => `- ${c.name}: ${c.linkedin_recent_signals}`).join('\n')}

Fading contacts (60+ days):
${mockContacts.filter(c => (c.days_since_contact || 0) > 60).map(c => `- ${c.name} (${c.company}) — ${c.days_since_contact} days, score ${c.health_score}`).join('\n')}`

  // Stream response back to client
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamChat(contextPrompt, messages)) {
          controller.enqueue(encoder.encode(chunk))
        }
      } catch (err) {
        console.error('Chat stream error:', err)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}
