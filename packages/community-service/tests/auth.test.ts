import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test
import { test } from 'node:test'
import { getSessionUserId } from '../auth.ts'

test('accepts string and integer database user IDs', () => {
  assert.equal(getSessionUserId({
    user: { id: 'user-id' },
  }), 'user-id')
  assert.equal(getSessionUserId({
    user: { id: 42 },
  }), '42')
})

test('rejects missing and invalid user IDs', () => {
  assert.equal(getSessionUserId(null), null)
  assert.equal(getSessionUserId({ user: {} }), null)
  assert.equal(getSessionUserId({
    user: { id: 1.5 },
  }), null)
  assert.equal(getSessionUserId({
    user: { id: Number.MAX_SAFE_INTEGER + 1 },
  }), null)
})
