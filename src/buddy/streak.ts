import { getGlobalConfig, saveGlobalConfig } from '../utils/config.js'

function getTodayLocal(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function getYesterdayLocal(): string {
  const now = new Date()
  now.setDate(now.getDate() - 1)
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function processStreak(): { streak: number, bonusXp: number, message: string | null } {
  const config = getGlobalConfig()
  const today = getTodayLocal()
  const yesterday = getYesterdayLocal()
  const lastDate = config.companionLastStreakDate
  let streak = config.companionStreakCount ?? 0
  let bonusXp = 0
  let message: string | null = null

  if (lastDate === today) {
    return { streak, bonusXp: 0, message: null }
  }

  if (lastDate === yesterday) {
    streak += 1
  } else {
    streak = 1
  }

  if (streak === 3) { bonusXp = 0.5; message = '🔥 3 dias seguidos! +0.5 XP de bônus!' }
  else if (streak === 7) { bonusXp = 1; message = '🔥 7 dias seguidos! +1 XP de bônus!' }
  else if (streak === 14) { bonusXp = 2; message = '🔥 14 dias seguidos! +2 XP de bônus!' }
  else if (streak === 30) { bonusXp = 3; message = '🔥 30 dias seguidos! +3 XP de bônus!' }
  else if (streak % 10 === 0) { message = `🔥 ${streak} dias seguidos! Continue assim!` }

  saveGlobalConfig(curr => ({
    ...curr,
    companionStreakCount: streak,
    companionLastStreakDate: today,
  }))

  return { streak, bonusXp, message }
}
