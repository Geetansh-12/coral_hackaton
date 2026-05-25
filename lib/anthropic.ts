// ============================================================
// Anthropic Claude API — AI Agent wrapper
// Used for chat, pre-meeting briefs, and daily digests
// ============================================================

import Anthropic from '@anthropic-ai/sdk'

const getClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'sk-ant-...') {
    return null
  }
  return new Anthropic({ apiKey })
}

/** Generate a one-shot response (for briefs, digests) */
export async function generateBrief(systemPrompt: string, userPrompt: string): Promise<string> {
  const client = getClient()
  if (!client) {
    return generateMockBrief(userPrompt)
  }

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  return message.content[0].type === 'text' ? message.content[0].text : ''
}

/** Streaming chat — yields text chunks for real-time UI */
export async function* streamChat(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[]
): AsyncGenerator<string> {
  const client = getClient()
  if (!client) {
    // Mock streaming for demo
    yield* mockStreamResponse(messages[messages.length - 1]?.content || '', systemPrompt)
    return
  }

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  })

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      yield chunk.delta.text
    }
  }
}

// ---------- Mock responses for demo mode ----------

function generateMockBrief(prompt: string): string {
  if (prompt.toLowerCase().includes('pre-meeting')) {
    return `**Last interaction**
You had a video call about the Q3 roadmap alignment two weeks ago. They mentioned wanting to explore a partnership around developer tools.

**What's new with them**
They recently posted about scaling their engineering team and shared thoughts on AI-first development workflows.

**Open threads**
- You promised to send over the technical architecture doc
- They were going to introduce you to their head of partnerships

**Suggested talking points**
- Ask about their hiring progress and what roles they're prioritizing
- Follow up on the partnership conversation — bring a concrete proposal
- Their recent post about AI workflows — share your perspective

**Relationship pulse**
This is a warm professional relationship with genuine mutual interest. The momentum is good — don't let it cool by delaying follow-ups.`
  }

  return `Here's your morning relationship radar:

**Reach out today**
1. **Sarah Chen** — It's been 45 days since your last chat. She just got promoted to VP of Engineering. A quick congratulations would be perfect timing.
2. **Marcus Rivera** — You had a great conversation at the conference but never followed up. Send that article you mentioned.
3. **Priya Patel** — She's been engaging with your posts lately but you haven't responded. A simple thank-you DM would strengthen this connection.

**Worth a congratulations**
Alex Kim just moved to Anthropic as a Staff Engineer — worth a warm note since you worked together at the previous company.

**Heads up before today's meetings**
Your 2pm with Jordan Taylor: they recently raised a Series B. Come prepared to discuss how you might collaborate at their new scale.`
}

function readContactContext(systemPrompt: string) {
  const marker = 'Current contact context:'
  if (!systemPrompt.includes(marker)) return null

  const section = systemPrompt.split(marker)[1].split('\n\nNetwork overview:')[0]
  const get = (label: string) => {
    const match = section.match(new RegExp(`${label}: (.*)`))
    return match?.[1]?.trim() || ''
  }

  return {
    name: get('Name'),
    company: get('Company'),
    role: get('Role'),
    relationship: get('Relationship'),
    score: get('Health score'),
    days: get('Days since contact'),
    tags: get('Tags'),
    notes: get('Notes'),
    signals: get('LinkedIn signals'),
  }
}

async function* mockStreamResponse(question: string, systemPrompt = ''): AsyncGenerator<string> {
  let response = ''
  const contact = readContactContext(systemPrompt)
  const q = question.toLowerCase()

  if (contact?.name) {
    const firstName = contact.name.split(' ')[0]
    const hasSignal = Boolean(contact.signals && contact.signals !== 'none')

    if (q.includes('draft') || q.includes('write') || q.includes('message') || q.includes('follow')) {
      response = `Here is a warm draft for ${contact.name}:\n\nHey ${firstName}, ${hasSignal ? `saw the update: ${contact.signals}. Huge congrats.` : `you came to mind today and I realized it has been ${contact.days} days since we last caught up.`} I would love to hear what you are focused on at ${contact.company}. Are you open to a quick catch-up next week?\n\nWhy this works: it is specific, light, and gives them an easy yes/no path.`
    } else {
      response = `${contact.name} is ${contact.role} at ${contact.company}. Relationship type: ${contact.relationship}. Health score: ${contact.score}, with ${contact.days} days since your last touchpoint.\n\nWhat matters: ${contact.notes || 'No personal note is saved yet.'}\n\n${hasSignal ? `Recent signal: ${contact.signals}.\n\nBest next move: send a timely congratulations note and ask what they are building next.` : `Best next move: send a short reconnect note anchored in their ${contact.tags || 'current'} context.`}`
    }
  } else if (question.toLowerCase().includes("haven't") || question.toLowerCase().includes('while')) {
    response = `Looking at your network, here are the relationships that need some attention:\n\n**🔴 Going cold (60+ days)**\n- **Sarah Chen** (Stripe, VP Engineering) — 72 days. You used to chat monthly. She recently got promoted, perfect excuse to reconnect.\n- **David Park** (Notion, PM Lead) — 65 days. Last email was about the API integration project.\n- **Rachel Kim** (a]16z, Partner) — 89 days. She introduced you to two portfolio companies last year.\n\n**🟡 Starting to fade (30-60 days)**\n- **James Liu** (Google, Staff SWE) — 45 days. You had coffee plans that fell through.\n- **Maya Johnson** (Linear, Head of Design) — 38 days. Great rapport from the design systems conversation.\n\nI'd prioritize Sarah and Rachel — both are high-value relationships where a quick message would go a long way. Want me to draft something?`
  } else if (question.toLowerCase().includes('reach out') || question.toLowerCase().includes('today')) {
    response = `Here's who I'd reach out to today, based on timing and opportunity:\n\n**1. Alex Kim** — Just changed jobs to Anthropic (3 days ago). A "congrats on the new role" message now will feel genuine, not performative. You worked together for 2 years.\n\n**2. Priya Patel** — She commented on your last two posts but you haven't responded. A quick DM thanking her and asking about her startup would take 30 seconds and mean a lot.\n\n**3. Marcus Rivera** — Your meeting last week went well but there's no follow-up yet. Send the deck you mentioned. Strike while the iron's warm.\n\n**Bonus**: Jordan Taylor has a birthday next week (LinkedIn). Set a reminder to send a personal note — not the generic LinkedIn button.`
  } else if (question.toLowerCase().includes('job') || question.toLowerCase().includes('changed')) {
    response = `Here are recent job changes in your network (last 30 days):\n\n**🎉 New roles**\n- **Alex Kim** → Staff Engineer at Anthropic (was at Google)\n- **Nadia Hassan** → VP of Product at Figma (was at Spotify)\n- **Tom Chen** → Founded a stealth startup (left Meta)\n\n**📈 Promotions**\n- **Sarah Chen** → VP of Engineering at Stripe (was Senior Director)\n- **Luis Garcia** → Principal Engineer at Vercel\n\n**Key insight**: Alex and Tom are in transition moments — people are most receptive to outreach during career changes. A genuine congratulations message now builds disproportionate goodwill.\n\nWant me to draft personalized messages for any of them?`
  } else if (q.includes('coral') || q.includes('capabilit') || q.includes('technical')) {
    response = `This demo uses Coral as the agent data layer, not just as a logo.\n\n1. One SQL interface: the agent can ask one SQL question instead of making separate Gmail, Calendar, Slack, LinkedIn, X, and Notion calls.\n2. Cross-source joins: contact_relationship_graph joins six sources into one relationship row.\n3. Catalog discovery: SQL Explorer includes coral.tables and coral.columns examples so judges can see how agents discover schemas.\n4. Parameter hints: pre-meeting briefs and fading-contact queries use $1/$2-style inputs instead of raw string interpolation.\n5. Cache and freshness: the query sandbox surfaces cache hits, timing, and materialized-view freshness.\n6. Ops abstraction: the project story covers centralized auth, retries, pagination, rate limits, schema mapping, and local execution.\n\nThe best judging path is Dashboard -> Coral capability cockpit -> SQL Explorer -> run a custom query.`
  } else if (question.toLowerCase().includes('health') || question.toLowerCase().includes('network') || question.toLowerCase().includes('overall')) {
    response = `Your network is in decent shape, but there's room to grow.\n\nOut of 34 tracked relationships, 12 are strong (70+ health score), 14 are fading (40-70), and 8 have gone dormant. Your average health score is 58/100 — that's like a B-minus. You're great at maintaining your inner circle but the wider professional network is quietly atrophying.\n\nThis week, I'd focus on two things: First, send a quick check-in to Rachel Kim and David Park — both are high-value connections that have slipped past the 60-day mark. Even a "saw this and thought of you" message resets the clock. Second, respond to the three LinkedIn messages sitting in your inbox. Ignoring those sends a signal.\n\nOn the bright side, your relationship with the Vercel team is thriving — 15 touchpoints this month across email, Slack, and meetings. Whatever you're doing there, do more of it across your network.`
  } else {
    response = `I checked the relationship graph.\n\n- 34 active contacts are tracked across Gmail, Calendar, Slack, LinkedIn, X, and Notion.\n- Email is the strongest channel, followed by Slack and meetings.\n- Close contacts average about 12 days between touchpoints.\n- The biggest opportunity is timely outreach around career signals and contacts drifting past 60 days.\n\nTry a person by name, like "Luis Garcia", or ask "who should I reach out to today?" and I will turn it into a specific action plan.`
  }

  // Simulate streaming by yielding word by word
  const words = response.split(' ')
  for (let i = 0; i < words.length; i++) {
    yield words[i] + (i < words.length - 1 ? ' ' : '')
    // Small delay simulation via empty yields
    if (i % 8 === 0 && i > 0) {
      yield ''
    }
  }
}
