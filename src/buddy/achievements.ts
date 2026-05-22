import { getGlobalConfig } from '../utils/config.js'

export type Achievement = {
  id: string
  name: string
  description: string
  emoji: string
  check: () => boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-commit',
    name: 'Primeiro Commit',
    description: 'Complete seu primeiro comando bash',
    emoji: '🎯',
    check: () => (getGlobalConfig().companionStats?.totalBashes ?? 0) >= 1,
  },
  {
    id: 'maratonista',
    name: 'Maratonista',
    description: 'Execute 100 comandos bash',
    emoji: '🏃',
    check: () => (getGlobalConfig().companionStats?.totalBashes ?? 0) >= 100,
  },
  {
    id: 'maratonista-1k',
    name: 'Maratonista de Elite',
    description: 'Execute 1000 comandos bash',
    emoji: '🏅',
    check: () => (getGlobalConfig().companionStats?.totalBashes ?? 0) >= 1000,
  },
  {
    id: 'bug-hunter',
    name: 'Bug Hunter',
    description: 'Encontre 20 erros',
    emoji: '🐛',
    check: () => (getGlobalConfig().companionStats?.totalErrors ?? 0) >= 20,
  },
  {
    id: 'bug-slayer',
    name: 'Bug Slayer',
    description: 'Encontre 100 erros',
    emoji: '⚔️',
    check: () => (getGlobalConfig().companionStats?.totalErrors ?? 0) >= 100,
  },
  {
    id: 'task-master',
    name: 'Task Master',
    description: 'Complete 50 tasks',
    emoji: '✅',
    check: () => (getGlobalConfig().companionStats?.totalTasks ?? 0) >= 50,
  },
  {
    id: 'task-legend',
    name: 'Task Legend',
    description: 'Complete 200 tasks',
    emoji: '🏆',
    check: () => (getGlobalConfig().companionStats?.totalTasks ?? 0) >= 200,
  },
  {
    id: 'streak-warrior',
    name: 'Streak Warrior',
    description: 'Mantenha um streak de 30 dias',
    emoji: '🔥',
    check: () => (getGlobalConfig().companionStreakCount ?? 0) >= 30,
  },
  {
    id: 'streak-obsessed',
    name: 'Streak Obsessed',
    description: 'Mantenha um streak de 90 dias',
    emoji: '💎',
    check: () => (getGlobalConfig().companionStreakCount ?? 0) >= 90,
  },
  {
    id: 'pet-lover',
    name: 'Pet Lover',
    description: 'Acaricie seu buddy 100 vezes',
    emoji: '❤️',
    check: () => (getGlobalConfig().companionStats?.totalPets ?? 0) >= 100,
  },
  {
    id: 'pet-addict',
    name: 'Pet Addict',
    description: 'Acaricie seu buddy 500 vezes',
    emoji: '💖',
    check: () => (getGlobalConfig().companionStats?.totalPets ?? 0) >= 500,
  },
  {
    id: 'evolver',
    name: 'Evolver',
    description: 'Evolua seu buddy',
    emoji: '🧬',
    check: () => (getGlobalConfig().companionMemory ?? []).some(m => m.trigger === 'evolve'),
  },
  {
    id: 'konami-master',
    name: 'Konami Master',
    description: 'Ative o Konami Code',
    emoji: '🎮',
    check: () => (getGlobalConfig().companionMemory ?? []).some(m => m.trigger === 'konami'),
  },
  {
    id: 'fashionista',
    name: 'Fashionista',
    description: 'Desbloqueie 5 outfits',
    emoji: '👗',
    check: () => (getGlobalConfig().companionOutfits ?? []).length >= 5,
  },
  {
    id: 'fashion-king',
    name: 'Fashion King',
    description: 'Desbloqueie 10 outfits',
    emoji: '👑',
    check: () => (getGlobalConfig().companionOutfits ?? []).length >= 10,
  },
  {
    id: 'legendary',
    name: 'Lendário',
    description: 'Alcance o Level 10',
    emoji: '👑',
    check: () => (getGlobalConfig().companion?.xp ?? 0) >= 400,
  },
  {
    id: 'easter-hunter',
    name: 'Easter Hunter',
    description: 'Encontre 3 easter eggs diferentes',
    emoji: '🥚',
    check: () => {
      const memories = getGlobalConfig().companionMemory ?? []
      const eggTriggers = ['easterEgg', 'konami', 'doubleRainbow', 'loopInfinite', 'answer42', 'midnightEvolve']
      const found = new Set(memories.filter(m => eggTriggers.includes(m.trigger)).map(m => m.trigger))
      return found.size >= 3
    },
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Use o buddy entre 00:00 e 01:00',
    emoji: '🦉',
    check: () => (getGlobalConfig().companionMemory ?? []).some(m => m.trigger === 'midnightEvolve'),
  },
  {
    id: 'rainbow-warrior',
    name: 'Rainbow Warrior',
    description: 'Ative o Double Rainbow',
    emoji: '🌈',
    check: () => (getGlobalConfig().companionMemory ?? []).some(m => m.trigger === 'doubleRainbow'),
  },
  {
    id: 'premium-user',
    name: 'Premium User',
    description: 'Use o modo premium',
    emoji: '⭐',
    check: () => (getGlobalConfig().companionMemory ?? []).some(m => m.trigger === 'petPremium'),
  },
  {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    description: 'Receba 10 dicas de code review',
    emoji: '🔍',
    check: () => (getGlobalConfig().companionStats?.totalBashes ?? 0) >= 50, // Approximate
  },
]

export function getUnlockedAchievements(): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.check())
}

export function getAchievementProgress(): Array<{
  achievement: Achievement
  unlocked: boolean
}> {
  return ACHIEVEMENTS.map(a => ({
    achievement: a,
    unlocked: a.check(),
  }))
}
