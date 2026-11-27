import assert from 'node:assert/strict'
import process from 'node:process'
// eslint-disable-next-line test/no-import-node-test
import { after, test } from 'node:test'
import { POST } from '../app/api/community/chatbot/route.ts'

process.env.COMMUNITY_ALLOWED_ORIGINS = 'https://playground.example'
process.env.DEEPSEEK_API_KEY = 'test-key'
const originalFetch = globalThis.fetch

after(() => {
  globalThis.fetch = originalFetch
})

function request(messages: unknown, origin = 'https://playground.example'): Request {
  return new Request('https://service.example/api/community/chatbot', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify({ messages }),
  })
}

test('rejects invalid origins and oversized messages before contacting DeepSeek', async () => {
  assert.equal((await POST(request([
    { role: 'user', content: 'hello' },
  ], 'https://other.example'))).status, 403)
  assert.equal((await POST(request([
    {
      role: 'user',
      content: 'a'.repeat(141),
    },
  ]))).status, 400)
  assert.equal((await POST(request([
    { role: 'assistant', content: 'hello' },
  ]))).status, 400)
})

test('forwards a valid conversation and streams the model response', async () => {
  const stream = 'data: {"choices":[{"delta":{"content":"hello"}}]}\n\ndata: [DONE]\n\n'
  globalThis.fetch = async (input, init) => {
    assert.equal(input, 'https://api.deepseek.com/chat/completions')
    assert.equal(init?.method, 'POST')
    const body = JSON.parse(String(init?.body))
    assert.equal(body.stream, true)
    assert.deepEqual(body.messages.slice(1), [
      { role: 'user', content: 'hi' },
    ])
    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream' },
    })
  }
  const response = await POST(request([
    { role: 'user', content: 'hi' },
  ]))
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://playground.example')
  assert.equal(await response.text(), stream)
})
