import process from 'node:process'
import { withCommunityCors } from '../../../../community-cors.ts'

export const maxDuration = 30

interface Message {
  role: 'user' | 'assistant'
  content: string
}

async function postChatbot(request: Request): Promise<Response> {
  const data: unknown = await request.json()
  if (typeof data !== 'object' || data === null || !('messages' in data) || !Array.isArray(data.messages) || data.messages.length < 1 || data.messages.length > 100)
    return Response.json({ error: 'Invalid conversation' }, { status: 400 })
  const messages: Message[] = []
  for (const item of data.messages) {
    if (typeof item !== 'object' || item === null || (item.role !== 'user' && item.role !== 'assistant') || typeof item.content !== 'string' || !item.content.trim() || item.content.length > (item.role === 'user'
      ? 140
      : 4000)) {
      return Response.json({ error: 'Invalid message' }, { status: 400 })
    }
    messages.push({ role: item.role, content: item.content })
  }
  if (messages.at(-1)?.role !== 'user')
    return Response.json({ error: 'The last message must be from the user' }, { status: 400 })
  if (!process.env.DEEPSEEK_API_KEY)
    return Response.json({ error: 'Chatbot is not configured' }, { status: 503 })
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a helpful assistant running inside MURASAKI, a personal nostalgic project. You are concise and fascinated by the past and retro art styles. Answer clearly without lengthy explanations.' },
        ...messages,
      ],
      max_tokens: 500,
      temperature: 0.46,
      stream: true,
    }),
    signal: request.signal,
  })
  if (!response.ok || !response.body) {
    console.error('DeepSeek request failed:', response.status)
    return Response.json({ error: 'Chat service unavailable' }, { status: 502 })
  }
  return new Response(response.body, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store' },
  })
}

export const POST = withCommunityCors(postChatbot)
export const OPTIONS = withCommunityCors(async () => new Response(null))
