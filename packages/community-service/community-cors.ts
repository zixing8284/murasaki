import process from 'node:process'

type CommunityHandler = (request: Request) => Promise<Response>

const METHODS = 'GET, POST, OPTIONS'
const HEADERS = 'Content-Type'

function isAllowedOrigin(origin: string): boolean {
  const configuredOrigins = process.env.COMMUNITY_ALLOWED_ORIGINS
  const origins = configuredOrigins
    ? configuredOrigins
        .split(',')
        .map(value => value.trim())
        .filter(Boolean)
    : ['http://localhost:5173']
  return origins.includes(origin)
}

function applyCors(response: Response, origin: string): Response {
  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', origin)
  headers.set('Access-Control-Allow-Methods', METHODS)
  headers.set('Access-Control-Allow-Headers', HEADERS)
  headers.append('Vary', 'Origin')
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export function withCommunityCors(handler: CommunityHandler): CommunityHandler {
  return async (request) => {
    const origin = request.headers.get('origin')

    if (origin && !isAllowedOrigin(origin))
      return Response.json({ error: 'Invalid origin' }, { status: 403 })

    if (request.method === 'OPTIONS') {
      if (!origin)
        return Response.json({ error: 'Origin is required' }, { status: 403 })
      return applyCors(new Response(null, { status: 204 }), origin)
    }

    if (request.method === 'POST' && !origin)
      return Response.json({ error: 'Origin is required' }, { status: 403 })

    const response = await handler(request)
    return origin
      ? applyCors(response, origin)
      : response
  }
}
