import type { AuthConfig } from '@auth/core'
import process from 'node:process'
import { Auth } from '@auth/core'
import GitHub from '@auth/core/providers/github'
import NeonAdapter from '@auth/neon-adapter'
import { Pool } from '@neondatabase/serverless'

function config(): AuthConfig {
  return {
    adapter: NeonAdapter(new Pool({ connectionString: process.env.DATABASE_URL })),
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    basePath: '/api/community/auth',
    providers: [
      GitHub({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
      }),
    ],
    callbacks: {
      session: ({ session, user }) => ({
        ...session,
        user: { ...session.user, id: user.id },
      }),
    },
  }
}

export async function handleAuth(request: Request): Promise<Response> {
  if (!process.env.AUTH_URL)
    throw new Error('AUTH_URL is not configured')
  const url = new URL(request.url)
  const publicUrl = new URL(`${url.pathname}${url.search}`, process.env.AUTH_URL)
  return Auth(new Request(publicUrl, request), config())
}

export async function getUserId(request: Request): Promise<string | null> {
  if (!process.env.AUTH_URL)
    throw new Error('AUTH_URL is not configured')
  const response = await Auth(new Request(`${process.env.AUTH_URL}/session`, {
    headers: { cookie: request.headers.get('cookie') ?? '' },
  }), config())
  if (!response.ok)
    throw new Error(`Session lookup failed (${response.status})`)
  const session: unknown = await response.json()
  if (typeof session !== 'object' || session === null || !('user' in session) || typeof session.user !== 'object' || session.user === null || !('id' in session.user) || typeof session.user.id !== 'string')
    return null
  return session.user.id
}
