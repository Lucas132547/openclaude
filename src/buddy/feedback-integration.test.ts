import { describe, it, expect, mock, beforeEach } from 'bun:test'

// Mutable mock config — shared across all mocks
let mockConfig: Record<string, any> = {}

// Mock config.js (used by observer, companion, memory, easter-eggs)
mock.module('../utils/config.js', () => ({
  getGlobalConfig: () => mockConfig,
  saveGlobalConfig: (fn: (prev: any) => any) => {
    mockConfig = fn(mockConfig)
  },
}))

// Mock messages.js to avoid heavy transitive deps (Anthropic SDK, lodash-es, analytics)
mock.module('../utils/messages.js', () => ({
  getUserMessageText: (message: any) => {
    if (message?.type !== 'user') return null
    const content = message?.message?.content ?? message?.content
    if (!content) return null
    if (typeof content === 'string') return content
    if (Array.isArray(content)) {
      return content
        .filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join(' ')
    }
    return null
  },
}))

// Mock memoryScan for skills.ts transitive import
mock.module('../memdir/memoryScan.js', () => ({
  scanMemoryFiles: async () => [],
  formatMemoryManifest: () => '',
}))

// Mock paths for skills.ts transitive import
mock.module('../memdir/paths.js', () => ({
  getAutoMemPath: () => '/tmp/test-auto-mem',
  isAutoMemoryEnabled: () => false,
}))

// Mock feedbackLog for feedbackHook.ts transitive import (if resolved)
mock.module('../memdir/feedbackLog.js', () => ({
  logFeedbackEvent: () => {},
}))

import { fireCompanionObserver, notifyFeedbackConfirm } from './observer.js'

function getTodayString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

describe('buddy-feedback integration', () => {
  beforeEach(() => {
    mockConfig = {
      companion: {
        name: 'Pixelbud',
        species: 'duck',
        xp: 10,
        hat: 'none',
        hatchedAt: Date.now(),
        personality: 'happy',
      },
      companionStats: {
        totalBashes: 5,
        totalTasks: 2,
        totalErrors: 0,
        totalPets: 1,
        daysActive: 1,
        totalTokensSaved: 0,
        totalFeedbackRules: 0,
        totalFeedbackConfirms: 0,
      },
      companionLastPetDate: new Date().toISOString().split('T')[0],
      companionStreakCount: 1,
      companionMemory: [],
      companionLastActiveDate: getTodayString(),
    }
  })

  it('feedback detection triggers observer reaction', async () => {
    const reactions: string[] = []
    const mockOnReaction = (r: string | undefined) => {
      if (r) reactions.push(r)
    }

    // Need a tool_result as last message for the feedback branch to trigger
    const messages = [
      {
        type: 'user',
        message: {
          content: [{ type: 'text', text: 'some command output' }],
        },
      },
      {
        type: 'tool_result',
        name: 'Bash',
        content: 'some output from tool',
        is_error: false,
      },
    ] as any[]

    await fireCompanionObserver(messages, mockOnReaction, {
      detected: true,
      type: 'correction',
      message: 'correction detected',
    })

    expect(reactions.length).toBeGreaterThan(0)
    expect(reactions.some(r => r.includes('Pixelbud'))).toBe(true)
  })

  it('notifyFeedbackConfirm grants XP and increments stats', () => {
    const result = notifyFeedbackConfirm('Pixelbud')

    expect(result).toContain('Pixelbud')
    expect(mockConfig.companion.xp).toBe(12) // 10 + 2
    expect(mockConfig.companionStats.totalFeedbackConfirms).toBe(1)
  })
})
