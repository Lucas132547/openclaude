import { getGlobalConfig } from '../utils/config.js'

export type BuddyMood = {
  emoji: string
  text: string
  mood: 'feliz' | 'orgulhoso' | 'preocupado' | 'sonolento' | 'empolgado' | 'neutro'
}

export function getMood(): BuddyMood {
  const config = getGlobalConfig()
  const stats = config.companionStats
  const lastPetDate = config.companionLastPetDate
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  // Sonolento: não pet hoje
  if (lastPetDate !== today) {
    return { emoji: '😴', text: 'Tô com sono... me dá um pet?', mood: 'sonolento' }
  }

  if (!stats) {
    return { emoji: '😊', text: 'Feliz em estar aqui!', mood: 'feliz' }
  }

  const errorRate = stats.totalBashes > 0 ? stats.totalErrors / stats.totalBashes : 0

  // Preocupado: muitos erros recentes
  if (errorRate > 0.4 && stats.totalBashes > 10) {
    return { emoji: '😟', text: 'Tem dado muitos erros... quer ajuda?', mood: 'preocupado' }
  }

  // Empolgado: muitas tasks completadas
  if (stats.totalTasks > 0 && stats.totalTasks % 10 === 0) {
    return { emoji: '🤩', text: `${stats.totalTasks} tasks concluídas! Incrível!`, mood: 'empolgado' }
  }

  // Orgulhoso: streak alto
  const streak = config.companionStreakCount ?? 0
  if (streak >= 7) {
    return { emoji: '😤', text: `${streak} dias seguidos! Orgulhoso de você!`, mood: 'orgulhoso' }
  }

  // Feliz: pet do dia feito, sem problemas
  return { emoji: '😄', text: 'Tudo fluindo bem!', mood: 'feliz' }
}
