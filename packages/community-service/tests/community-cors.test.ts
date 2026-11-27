import assert from 'node:assert/strict'
import process from 'node:process'
// eslint-disable-next-line test/no-import-node-test
import { test } from 'node:test'
import { withCommunityCors } from '../community-cors.ts'

process.env.COMMUNITY_ALLOWED_ORIGINS = 'https://murasaki-playground.vercel.app, https://zixing8284.github.io'

const handler = withCommunityCors(async () => Response.json({ ok: true }))

test('allows configured cross-origin requests and preflights', async () => {
  const response = await handler(new Request('https://service.example/api/community/guestbook', {
    headers: { origin: 'https://zixing8284.github.io' },
  }))
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://zixing8284.github.io')

  const preflight = await handler(new Request('https://service.example/api/community/guestbook', {
    method: 'OPTIONS',
    headers: {
      'origin': 'https://zixing8284.github.io',
      'access-control-request-method': 'POST',
    },
  }))
  assert.equal(preflight.status, 204)
  assert.equal(preflight.headers.get('access-control-allow-methods'), 'GET, POST, OPTIONS')
})

test('rejects unconfigured origins and originless writes', async () => {
  const disallowed = await handler(new Request('https://service.example/api/community/guestbook', {
    headers: { origin: 'https://untrusted.example' },
  }))
  assert.equal(disallowed.status, 403)

  const originlessPost = await handler(new Request('https://service.example/api/community/guestbook', {
    method: 'POST',
  }))
  assert.equal(originlessPost.status, 403)
})
