import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test
import { test } from 'node:test'
import { parseGuestbookSubmission } from '../guestbook-validation.ts'

test('trims and validates required visitor details', () => {
  assert.deepEqual(parseGuestbookSubmission({
    name: '  Murasaki  ',
    email: '  USER@example.com ',
    comment: '  Hello there  ',
  }), {
    name: 'Murasaki',
    email: 'user@example.com',
    comment: 'Hello there',
  })
})

test('rejects missing, invalid, and oversized guestbook fields', () => {
  assert.equal(parseGuestbookSubmission({ comment: 'Hello' }), null)
  assert.equal(parseGuestbookSubmission({
    name: 'Murasaki',
    email: 'not-an-email',
    comment: 'Hello',
  }), null)
  assert.equal(parseGuestbookSubmission({
    name: 'Murasaki',
    email: 'user@example.com',
    comment: 'x',
  }), null)
  assert.equal(parseGuestbookSubmission({
    name: 'x'.repeat(81),
    email: 'user@example.com',
    comment: 'Hello',
  }), null)
})
