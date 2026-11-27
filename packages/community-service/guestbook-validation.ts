export interface GuestbookSubmission {
  name: string
  email: string
  comment: string
}

export function parseGuestbookSubmission(data: unknown): GuestbookSubmission | null {
  if (typeof data !== 'object' || data === null || !('name' in data) || !('email' in data) || !('comment' in data))
    return null

  if (typeof data.name !== 'string' || typeof data.email !== 'string' || typeof data.comment !== 'string')
    return null

  const name = data.name.trim()
  const email = data.email.trim().toLowerCase()
  const comment = data.comment.trim()
  const [localPart, domain, extra] = email.split('@')
  const domainParts = domain?.split('.') ?? []
  if (
    !name
    || name.length > 80
    || email.length > 254
    || !localPart
    || !domain
    || extra !== undefined
    || /\s/.test(email)
    || domainParts.length < 2
    || domainParts.some(part => !part)
    || comment.length < 2
    || comment.length > 140
  ) {
    return null
  }

  return { name, email, comment }
}
