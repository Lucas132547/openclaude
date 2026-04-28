import { describe, expect, it } from 'bun:test'
import { detectBlockedFileModifications } from './bashCommandValidation.ts'

describe('detectBlockedFileModifications', () => {
  it('should detect redirection to a real file', () => {
    expect(detectBlockedFileModifications('echo "foo" > out.txt')).toBe(true)
    expect(detectBlockedFileModifications('echo "Esse texto deve ser bloqueado" > docs/teste_bloqueio.txt')).toBe(true)
  })
})