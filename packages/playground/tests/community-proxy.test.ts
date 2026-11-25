import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { once } from 'node:events'
import { createServer } from 'node:http'
import process from 'node:process'
// eslint-disable-next-line test/no-import-node-test
import { after, test } from 'node:test'
import handler from '../api/community-proxy.ts'

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
  const response = await fetch(`${proxyUrl}/api/community-proxy?path=auth%2Fcallback%2Fgithub&code=abc`, {
    method: 'POST',
    headers: { 'cookie': 'session=existing', 'content-type': 'application/x-www-form-urlencoded' },
    body: 'csrfToken=example',
  })
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    path: '/api/community/auth/callback/github?code=abc',
    method: 'POST',
    cookie: 'session=existing',
    body: 'csrfToken=example',
  })
  assert.deepEqual(response.headers.getSetCookie(), ['session=one; Path=/; HttpOnly', 'csrf=two; Path=/'])
})

test('rejects paths outside the community API', async () => {
  const response = await fetch(`${proxyUrl}/api/community-proxy?path=..%2Fadmin`)
  assert.equal(response.status, 404)
})
