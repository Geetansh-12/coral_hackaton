// ============================================================
// Google Gemini AI — Free-tier AI Agent wrapper
// Provides streaming chat and one-shot brief generation
// Falls back to mock responses when no API key is set
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai'

const MODEL_NAME = 'gemini-2.0-flash'

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey.length < 10) {
    return null
  }
  return new GoogleGenerativeAI(apiKey)
}

/** Generate a one-shot response (for briefs, digests) */
export async function generateGeminiBrief(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const client = getClient()
  if (!client) {
    return '' // caller should fall back to mock
  }

  try {
    const model = client.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: systemPrompt,
    })

    const result = await model.generateContent(userPrompt)
    const response = result.response
    return response.text()
  } catch (error) {
    console.error('[Gemini] Brief generation error:', error)
    return ''
  }
}

/** Streaming chat — yields text chunks for real-time UI */
export async function* streamGeminiChat(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[]
): AsyncGenerator<string> {
  const client = getClient()
  if (!client) {
    return // caller should fall back to mock
  }

  try {
    const model = client.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: systemPrompt,
    })

    // Convert messages to Gemini format
    // Gemini uses 'user' and 'model' roles (not 'assistant')
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: msg.content }],
    }))

    const chat = model.startChat({ history })

    // Get the last user message
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage) return

    const result = await chat.sendMessageStream(lastMessage.content)

    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) {
        yield text
      }
    }
  } catch (error) {
    console.error('[Gemini] Streaming chat error:', error)
    yield 'I encountered an issue connecting to the AI service. The relationship data is still available in the dashboard.'
  }
}

/** Check if Gemini is configured and available */
export function isGeminiAvailable(): boolean {
  return getClient() !== null
}
