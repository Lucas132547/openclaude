import { describe, expect, test, mock, beforeEach } from 'bun:test'

// Mock config before importing module under test
let mockConfig: Record<string, any> = {}

mock.module('../utils/config.js', () => ({
  getGlobalConfig: () => mockConfig,
  saveGlobalConfig: (fn: (prev: any) => any) => {
    mockConfig = fn(mockConfig)
  },
}))

import { getUnlockedAchievements } from './achievements.js'

describe('Feedback Achievements', () => {
  beforeEach(() => {
    mockConfig = {
      companion: {
        species: 'duck',
        name: 'TestBuddy',
        hat: 'none',
        xp: 50,
        hatchedAt: Date.now(),
      },
      companionStats: {
        totalBashes: 10,
        totalTasks: 5,
        totalErrors: 1,
        totalPets: 3,
        daysActive: 5,
        totalFeedbackRules: 0,
        totalFeedbackConfirms: 0,
      },
      companionMemory: [],
      companionOutfits: [],
      companionStreakCount: 0,
    }
  })

  test('no feedback achievements unlock at 0 confirms', () => {
    const achievements = getUnlockedAchievements()
    const feedbackAchievements = achievements.filter(a => a.id.startsWith('feedback-'))
    expect(feedbackAchievements).toHaveLength(0)
  })

  test('feedback-aprendiz unlocks at 5 confirms', () => {
    mockConfig.companionStats.totalFeedbackConfirms = 5
    const achievements = getUnlockedAchievements()
    const aprendiz = achievements.find(a => a.id === 'feedback-aprendiz')
    expect(aprendiz).toBeDefined()
    expect(aprendiz!.name).toBe('Aprendiz')
  })

  test('feedback-aprendiz locked at 4 confirms', () => {
    mockConfig.companionStats.totalFeedbackConfirms = 4
    const achievements = getUnlockedAchievements()
    const aprendiz = achievements.find(a => a.id === 'feedback-aprendiz')
    expect(aprendiz).toBeUndefined()
  })

  test('feedback-mestre unlocks at 15 confirms', () => {
    mockConfig.companionStats.totalFeedbackConfirms = 15
    const achievements = getUnlockedAchievements()
    const mestre = achievements.find(a => a.id === 'feedback-mestre')
    expect(mestre).toBeDefined()
    expect(mestre!.name).toBe('Mestre')
  })

  test('feedback-mestre locked at 14 confirms', () => {
    mockConfig.companionStats.totalFeedbackConfirms = 14
    const achievements = getUnlockedAchievements()
    const mestre = achievements.find(a => a.id === 'feedback-mestre')
    expect(mestre).toBeUndefined()
  })

  test('feedback-sabio unlocks at 30 confirms', () => {
    mockConfig.companionStats.totalFeedbackConfirms = 30
    const achievements = getUnlockedAchievements()
    const sabio = achievements.find(a => a.id === 'feedback-sabio')
    expect(sabio).toBeDefined()
    expect(sabio!.name).toBe('Sabio')
  })

  test('feedback-sabio locked at 29 confirms', () => {
    mockConfig.companionStats.totalFeedbackConfirms = 29
    const achievements = getUnlockedAchievements()
    const sabio = achievements.find(a => a.id === 'feedback-sabio')
    expect(sabio).toBeUndefined()
  })

  test('all feedback achievements unlock at 30 confirms', () => {
    mockConfig.companionStats.totalFeedbackConfirms = 30
    const achievements = getUnlockedAchievements()
    const feedbackAchievements = achievements.filter(a => a.id.startsWith('feedback-'))
    expect(feedbackAchievements).toHaveLength(3)
    expect(feedbackAchievements.map(a => a.id)).toEqual(
      expect.arrayContaining(['feedback-aprendiz', 'feedback-mestre', 'feedback-sabio'])
    )
  })
})
