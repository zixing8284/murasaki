import process from 'node:process'
import { neon } from '@neondatabase/serverless'
import { getUserId } from '../../../../auth'

const PAGE_SIZE = 50

export async function GET(request: Request): Promise<Response> {
  const page = Number(new URL(request.url).searchParams.get('page') ?? '1')
  if (!Number.isSafeInteger(page) || page < 1 || page > 100000) {
    return Response.json({ error: 'Invalid page' }, { status: 400 })
  }
  const sql = neon(process.env.DATABASE_URL!)
  const [counts, entries] = await Promise.all([
    sql`SELECT COUNT(*) AS count FROM guest_book`,
    sql`SELECT gb.id, gb.comment, gb.create_at, u.name
        FROM guest_book gb JOIN users u ON gb.user_id = u.id
        ORDER BY gb.create_at DESC, gb.id DESC
        LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
  ])
  return Response.json({
    entries: entries.reverse(),
    totalPages: Math.ceil(Number(counts[0].count) / PAGE_SIZE),
  }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get('origin')
  const publicOrigin = process.env.AUTH_URL
    ? new URL(process.env.AUTH_URL).origin
    : null
  if (!origin || origin !== publicOrigin) {
    return Response.json({ error: 'Invalid origin' }, { status: 403 })
  }
  const userId = await getUserId(request)
  if (!userId) {
    return Response.json({ error: 'Sign in to leave a message' }, { status: 401 })
  }
  const data: unknown = await request.json()
  const comment = typeof data === 'object' && data !== null && 'comment' in data
    ? data.comment
    : null
  if (typeof comment !== 'string' || comment.trim().length < 2 || comment.length > 140) {
    return Response.json({ error: 'Messages must be 2–140 characters' }, { status: 400 })
  }
  const sql = neon(process.env.DATABASE_URL!)
  await sql`INSERT INTO guest_book (comment, user_id) VALUES (${comment.trim()}, ${userId})`
  return Response.json({ ok: true }, { status: 201 })
}
