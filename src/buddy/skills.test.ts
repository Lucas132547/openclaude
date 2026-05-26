import { describe, it, expect, mock, beforeEach } from 'bun:test'

// Provide a complete mock so transitive imports don't break
const baseMemoryScanMock = {
  scanMemoryFiles: async () => [] as any[],
  formatMemoryManifest: () => '',
}

describe('getFeedbackTip', () => {
  beforeEach(() => {
    mock.restore()
  })

  it('returns null when no feedback rules exist', async () => {
    mock.module('../memdir/memoryScan.js', () => ({
      ...baseMemoryScanMock,
      scanMemoryFiles: async () => [],
    }))

    const { getFeedbackTip } = await import('./skills.js')
    const result = await getFeedbackTip(false, 'some context')
    expect(result).toBeNull()
  })

  it('returns a tip when feedback rules exist and random allows', async () => {
    mock.module('../memdir/memoryScan.js', () => ({
      ...baseMemoryScanMock,
      scanMemoryFiles: async () => [
        {
          filename: 'feedback-testing-patterns.md',
          filePath: '/test/feedback-testing-patterns.md',
          mtimeMs: Date.now(),
          description: 'Padroes de framework de teste',
          type: 'feedback',
          score: 80,
          confirmations: 3,
        },
      ],
    }))

    const originalRandom = Math.random
    Math.random = () => 0

    const { getFeedbackTip } = await import('./skills.js')
    const result = await getFeedbackTip(false, 'jest test failed')
    expect(result).not.toBeNull()
    expect(typeof result).toBe('string')

    Math.random = originalRandom
  })
})
