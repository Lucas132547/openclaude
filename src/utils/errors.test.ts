import { expect, test, describe } from 'bun:test'
import { isShellError, ShellError } from './errors.js'

describe('isShellError', () => {
  test('returns true for actual ShellError instances', () => {
    const err = new ShellError('out', 'err', 1, false)
    expect(isShellError(err)).toBe(true)
  })

  test('returns true for objects with name: "ShellError" (lost class identity)', () => {
    const err = {
      name: 'ShellError',
      message: 'Shell command failed',
      stdout: 'out',
      stderr: 'err',
      code: 1,
      interrupted: false,
    }
    expect(isShellError(err)).toBe(true)
  })

  test('returns false for other errors', () => {
    expect(isShellError(new Error('test'))).toBe(false)
    expect(isShellError({ name: 'Error', message: 'test' })).toBe(false)
  })

  test('returns false for non-objects', () => {
    expect(isShellError(null)).toBe(false)
    expect(isShellError('ShellError')).toBe(false)
    expect(isShellError(123)).toBe(false)
  })
})
