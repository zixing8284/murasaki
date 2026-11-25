import type { IncomingMessage, ServerResponse } from 'node:http'
import { request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'
import process from 'node:process'

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  const origin = process.env.COMMUNITY_SERVICE_ORIGIN
  if (!origin) {
    res.writeHead(503, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Community service is not configured' }))
    return
  }

  const incoming = new URL(req.url ?? '/', 'http://localhost')
  const path = incoming.searchParams.get('path') ?? ''
  incoming.searchParams.delete('path')
  if (!/^(?:guestbook|chatbot|auth(?:\/[\w-]+)*)$/.test(path)) {
    res.writeHead(404)
    res.end()
    return
  }

  const target = new URL(`/api/community/${path}`, origin)
  target.search = incoming.searchParams.toString()
  const send = target.protocol === 'https:'
    ? httpsRequest
    : httpRequest
  const upstream = send(target, {
    method: req.method,
    headers: {
      ...req.headers,
      'host': target.host,
      'x-forwarded-host': req.headers.host,
      'x-forwarded-proto': 'https',
    },
  }, (response) => {
    res.writeHead(response.statusCode ?? 502, response.headers)
    response.pipe(res)
  })
  upstream.on('error', (error) => {
    console.error('Community service proxy failed:', error)
    if (!res.headersSent)
      res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Community service unavailable' }))
  })
  req.pipe(upstream)
}
