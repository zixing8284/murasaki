import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { once } from 'node:events'
import { createServer } from 'node:http'
import process from 'node:process'
// eslint-disable-next-line test/no-import-node-test
import { after, test } from 'node:test'
import handler from '../../../api/community-proxy.ts'
import playgroundHandler from '../api/community-proxy.js'

test('root and playground deployments use the same proxy', () => {
  assert.equal(handler, playgroundHandler)
})

const upstream = createServer((request, response) => {
  const chunks: Buffer[] = []
  request.on('data', chunk => chunks.push(chunk))
  request.on('end', () => {
    response.setHeader('Set-Cookie', ['session=one; Path=/; HttpOnly', 'csrf=two; Path=/'])
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({
      path: request.url,
      method: request.method,
      cookie: request.headers.cookie,
      body: Buffer.concat(chunks).toString(),
    }))
  })
})
upstream.listen(0, '127.0.0.1')
await once(upstream, 'listening')
const address = upstream.address()
assert.ok(address && typeof address !== 'string')
process.env.COMMUNITY_SERVICE_ORIGIN = `http://127.0.0.1:${address.port}`

const proxy = createServer(handler)
proxy.listen(0, '127.0.0.1')
await once(proxy, 'listening')
const proxyAddress = proxy.address()
assert.ok(proxyAddress && typeof proxyAddress !== 'string')
const proxyUrl = `http://127.0.0.1:${proxyAddress.port}`

after(() => {
  upstream.close()
  proxy.close()
})

test('forwards requests, query parameters, bodies and cookies', async () => {
  const response = await fetch(`${proxyUrl}/api/community-proxy?path=guestbook&page=2`, {
    method: 'POST',
    headers: { 'cookie': 'session=existing', 'content-type': 'application/x-www-form-urlencoded' },
    body: 'comment=example',
  })
  assert.equal(response.status, 200)
  const forwarded = await response.json()
  assert.deepEqual(forwarded, {
    path: '/api/community/guestbook?page=2',
    method: 'POST',
    body: 'comment=example',
  })
  assert.equal('cookie' in forwarded, false)
  assert.deepEqual(response.headers.getSetCookie(), [])
})

test('rejects paths outside the community API', async () => {
  const response = await fetch(`${proxyUrl}/api/community-proxy?path=..%2Fadmin`)
  assert.equal(response.status, 404)
})
