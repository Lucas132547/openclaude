import { describe, it, expect, mock, beforeEach } from 'bun:test'

// Mutable mock config
let mockConfig: Record<string, any> = {}

mock.module('../utils/config.js', () => ({
  getGlobalConfig: () => mockConfig,
  saveGlobalConfig: (fn: (prev: any) => any) => {
    mockConfig = fn(mockConfig)
  },
}))

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

mock.module('../memdir/memoryScan.js', () => ({
  scanMemoryFiles: async () => [],
  formatMemoryManifest: () => '',
}))

mock.module('../memdir/paths.js', () => ({
  getAutoMemPath: () => '/tmp/test-auto-mem',
  isAutoMemoryEnabled: () => false,
}))

mock.module('../memdir/feedbackLog.js', () => ({
  logFeedbackEvent: () => {},
}))

import { fireCompanionObserver, notifyFeedbackConfirm } from './observer.js'

function getTodayString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

describe('observer reactions', () => {
  beforeEach(() => {
    mockConfig = {
      companion: {
        name: 'Echobud',
        species: 'snail',
        xp: 10,
        hat: 'none',
        hatchedAt: Date.now(),
        personality: 'Brincalhão',
        premiumUntil: 0,
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

  // ─── Task Completion ─────────────────────────────────────────────────
  describe('task completion', () => {
    it('grants +3 XP and reacts when TaskUpdate status:completed', async () => {
      const reactions: string[] = []
      const messages = [
        {
          type: 'assistant',
          content: [
            {
              type: 'tool_use',
              name: 'TaskUpdate',
              input: { status: 'completed' },
            },
          ],
        },
      ] as any[]

      await fireCompanionObserver(messages, (r) => { if (r) reactions.push(r) })

      expect(reactions.length).toBeGreaterThan(0)
      expect(reactions[0]).toContain('Echobud')
      expect(mockConfig.companion.xp).toBe(13) // 10 + 3
      expect(mockConfig.companionStats.totalTasks).toBe(3) // 2 + 1
    })

    it('announces level up when XP crosses threshold', async () => {
      // Set XP so task completion triggers level up (25 XP = level 2)
      mockConfig.companion.xp = 23
      const reactions: string[] = []

      const messages = [
        {
          type: 'assistant',
          content: [
            {
              type: 'tool_use',
              name: 'TaskUpdate',
              input: { status: 'completed' },
            },
          ],
        },
      ] as any[]

      await fireCompanionObserver(messages, (r) => { if (r) reactions.push(r) })

      expect(reactions[0]).toContain('Nível')
    })
  })

  // ─── Bash Success ────────────────────────────────────────────────────
  describe('bash success', () => {
    it('grants +0.1 XP on successful bash', async () => {
      const xpBefore = mockConfig.companion.xp
      const messages = [
        {
          type: 'tool_result',
          name: 'Bash',
          content: 'success output',
          is_error: false,
        },
      ] as any[]

      await fireCompanionObserver(messages, () => {})

      expect(mockConfig.companion.xp).toBeCloseTo(xpBefore + 0.1, 1)
      expect(mockConfig.companionStats.totalBashes).toBe(6) // 5 + 1
    })

    it('reacts ~20% of the time on success (deterministic check)', async () => {
      // Run multiple times to verify probability behavior
      const reactions: string[] = []
      const messages = [
        {
          type: 'tool_result',
          name: 'Bash',
          content: 'ok',
          is_error: false,
        },
      ] as any[]

      // Run 50 times — at least some should react
      for (let i = 0; i < 50; i++) {
        await fireCompanionObserver(messages, (r) => { if (r) reactions.push(r) })
      }

      // With 20% chance over 50 runs, we should get ~10 reactions (very unlikely to get 0)
      expect(reactions.length).toBeGreaterThan(0)
    })
  })

  // ─── Error Reactions ─────────────────────────────────────────────────
  describe('error reactions', () => {
    it('reacts to tool errors with error reply', async () => {
      const reactions: string[] = []
      const messages = [
        {
          type: 'tool_result',
          name: 'Bash',
          content: 'Error: Exit code 1',
          is_error: true,
        },
      ] as any[]

      await fireCompanionObserver(messages, (r) => { if (r) reactions.push(r) })

      expect(reactions.length).toBeGreaterThan(0)
      expect(reactions[0]).toContain('Echobud')
      expect(mockConfig.companionStats.totalErrors).toBe(1)
    })

    it('detects bash failure even without is_error flag', async () => {
      const reactions: string[] = []
      const messages = [
        {
          type: 'tool_result',
          name: 'Bash',
          content: 'Command failed with exit code 1',
          is_error: false,
        },
      ] as any[]

      await fireCompanionObserver(messages, (r) => { if (r) reactions.push(r) })

      expect(reactions.length).toBeGreaterThan(0)
      expect(mockConfig.companionStats.totalErrors).toBe(1)
    })
  })

  // ─── User Interactions ───────────────────────────────────────────────
  describe('user interactions', () => {
    it('reacts to /buddy command', async () => {
      const reactions: string[] = []
      const messages = [
        {
          type: 'user',
          message: { content: [{ type: 'text', text: '/buddy status' }] },
        },
      ] as any[]

      await fireCompanionObserver(messages, (r) => { if (r) reactions.push(r) })

      expect(reactions.length).toBe(1)
    })

    it('reacts to buddy name mention', async () => {
      const reactions: string[] = []
      const messages = [
        {
          type: 'user',
          message: { content: [{ type: 'text', text: 'Echobud, você está aí?' }] },
        },
      ] as any[]

      await fireCompanionObserver(messages, (r) => { if (r) reactions.push(r) })

      expect(reactions.length).toBe(1)
      expect(reactions[0]).toContain('Echobud')
    })

    it('reacts to stoneage keyword and grants +0.5 XP', async () => {
      const reactions: string[] = []
      const xpBefore = mockConfig.companion.xp

      const messages = [
        {
          type: 'user',
          message: { content: [{ type: 'text', text: 'stoneage on' }] },
        },
      ] as any[]

      await fireCompanionObserver(messages, (r) => { if (r) reactions.push(r) })

      expect(reactions.length).toBe(1)
      expect(reactions[0]).toContain('Echobud')
      expect(mockConfig.companion.xp).toBeCloseTo(xpBefore + 0.5, 1)
      expect(mockConfig.companionStats.totalTokensSaved).toBe(500)
    })
  })

  // ─── Easter Eggs ─────────────────────────────────────────────────────
  describe('easter eggs', () => {
    it('detects konami code and grants bonus XP', async () => {
      const reactions: string[] = []
      const xpBefore = mockConfig.companion.xp

      const messages = [
        {
          type: 'user',
          message: { content: [{ type: 'text', text: 'upupdowndownleftrightleftrightba' }] },
        },
      ] as any[]

      await fireCompanionObserver(messages, (r) => { if (r) reactions.push(r) })

      expect(reactions.length).toBe(1)
      expect(reactions[0]).toContain('🎮')
      expect(mockConfig.companion.xp).toBeGreaterThan(xpBefore)
      expect(mockConfig.companion.konamiUsed).toBe(true)
    })

    it('detects "42" answer in assistant message', async () => {
      const reactions: string[] = []
      const xpBefore = mockConfig.companion.xp

      const messages = [
        {
          type: 'assistant',
          content: 'A resposta para a vida, o universo e tudo mais é 42.',
        },
      ] as any[]

      await fireCompanionObserver(messages, (r) => { if (r) reactions.push(r) })

      expect(reactions.length).toBe(1)
      expect(reactions[0]).toContain('🔮')
      expect(mockConfig.companion.xp).toBeGreaterThan(xpBefore)
    })
  })

  // ─── Feedback ────────────────────────────────────────────────────────
  describe('feedback reactions', () => {
    it('reacts to correction feedback', async () => {
      const reactions: string[] = []
      const messages = [
        {
          type: 'tool_result',
          name: 'Bash',
          content: 'some output',
          is_error: false,
        },
      ] as any[]

      await fireCompanionObserver(messages, (r) => { if (r) reactions.push(r) }, {
        detected: true,
        type: 'correction',
        message: 'correction',
      })

      expect(reactions.length).toBeGreaterThan(0)
      expect(mockConfig.companionMemory.length).toBe(1)
    })

    it('reacts to undo feedback', async () => {
      const reactions: string[] = []
      const messages = [
        {
          type: 'tool_result',
          name: 'Bash',
          content: 'some output',
          is_error: false,
        },
      ] as any[]

      await fireCompanionObserver(messages, (r) => { if (r) reactions.push(r) }, {
        detected: true,
        type: 'undo',
        message: 'undo',
      })

      expect(reactions.length).toBeGreaterThan(0)
    })

    it('notifyFeedbackConfirm grants +2 XP', () => {
      const result = notifyFeedbackConfirm('Echobud')

      expect(result).toContain('Echobud')
      expect(mockConfig.companion.xp).toBe(12) // 10 + 2
      expect(mockConfig.companionStats.totalFeedbackConfirms).toBe(1)
    })
  })

  // ─── Muted Companion ─────────────────────────────────────────────────
  describe('muted companion', () => {
    it('does not react when companion is muted', async () => {
      mockConfig.companionMuted = true
      const reactions: string[] = []

      const messages = [
        {
          type: 'assistant',
          content: [
            {
              type: 'tool_use',
              name: 'TaskUpdate',
              input: { status: 'completed' },
            },
          ],
        },
      ] as any[]

      await fireCompanionObserver(messages, (r) => { if (r) reactions.push(r) })

      expect(reactions.length).toBe(0)
    })
  })

  // ─── No Companion ────────────────────────────────────────────────────
  describe('no companion', () => {
    it('does not react when companion is not set', async () => {
      mockConfig.companion = null
      const reactions: string[] = []

      const messages = [
        {
          type: 'assistant',
          content: [
            {
              type: 'tool_use',
              name: 'TaskUpdate',
              input: { status: 'completed' },
            },
          ],
        },
      ] as any[]

      await fireCompanionObserver(messages, (r) => { if (r) reactions.push(r) })

      expect(reactions.length).toBe(0)
    })
  })
})
