import process from 'node:process'
import { neon } from '@neondatabase/serverless'
import { withCommunityCors } from '../../../../community-cors.ts'
import { parseGuestbookSubmission } from '../../../../guestbook-validation.ts'

const PAGE_SIZE = 50

async function getGuestbook(request: Request): Promise<Response> {
  const page = Number(new URL(request.url).searchParams.get('page') ?? '1')
  if (!Number.isSafeInteger(page) || page < 1 || page > 100000) {
    return Response.json({ error: 'Invalid page' }, { status: 400 })
  }
  const sql = neon(process.env.DATABASE_URL!)
  const [counts, entries] = await Promise.all([
    sql`SELECT COUNT(*) AS count FROM guest_book`,
    sql`SELECT gb.id, gb.comment, gb.create_at,
               COALESCE(gb.author_name, u.name, 'Guest') AS name
        FROM guest_book gb LEFT JOIN users u ON gb.user_id = u.id
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

async function postGuestbook(request: Request): Promise<Response> {
  const submission: unknown = await request.json()
  const parsed = parseGuestbookSubmission(submission)
  if (!parsed)
    return Response.json({ error: 'Enter a name, valid email and a 2–140 character message' }, { status: 400 })

  const sql = neon(process.env.DATABASE_URL!)
  await sql`INSERT INTO guest_book (comment, user_id, author_name, email)
    VALUES (${parsed.comment}, NULL, ${parsed.name}, ${parsed.email})`
  return Response.json({ ok: true }, { status: 201 })
}

export const GET = withCommunityCors(getGuestbook)
export const POST = withCommunityCors(postGuestbook)
export const OPTIONS = withCommunityCors(async () => new Response(null))
