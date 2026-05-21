import { getGlobalConfig, saveGlobalConfig } from '../utils/config.js'

export type Outfit = {
  id: string
  name: string
  description: string
  requirement: string
  check: () => boolean
}

export const OUTFITS: Outfit[] = [
  {
    id: 'dourado',
    name: 'Dourado',
    description: 'Skin brilhante para mestres das tasks',
    requirement: 'Completar 100 tasks',
    check: () => (getGlobalConfig().companionStats?.totalTasks ?? 0) >= 100,
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'Skin luminosa para devotados',
    requirement: 'Streak de 30 dias',
    check: () => (getGlobalConfig().companionStreakCount ?? 0) >= 30,
  },
  {
    id: 'cyber',
    name: 'Cyber',
    description: 'Skin digital para bash masters',
    requirement: '500 comandos bash',
    check: () => (getGlobalConfig().companionStats?.totalBashes ?? 0) >= 500,
  },
  {
    id: 'fantasma',
    name: 'Fantasma',
    description: 'Skin etérea para os persistentes',
    requirement: 'Streak de 7 dias',
    check: () => (getGlobalConfig().companionStreakCount ?? 0) >= 7,
  },
  {
    id: 'arco-iris',
    name: 'Arco-Íris',
    description: 'Skin colorida para os sortudos',
    requirement: 'Encontrar um easter egg',
    check: () => {
      const memories = getGlobalConfig().companionMemory ?? []
      return memories.some(m => m.trigger === 'easterEgg')
    },
  },
]

export function getUnlockedOutfits(): string[] {
  return getGlobalConfig().companionOutfits ?? []
}

export function getActiveOutfit(): string | null {
  return getGlobalConfig().companionActiveOutfit ?? null
}

export function checkAndUnlockOutfits(): string[] {
  const config = getGlobalConfig()
  const unlocked = new Set(config.companionOutfits ?? [])
  const newlyUnlocked: string[] = []

  for (const outfit of OUTFITS) {
    if (!unlocked.has(outfit.id) && outfit.check()) {
      unlocked.add(outfit.id)
      newlyUnlocked.push(outfit.name)
    }
  }

  if (newlyUnlocked.length > 0) {
    saveGlobalConfig(curr => ({
      ...curr,
      companionOutfits: [...unlocked],
    }))
  }

  return newlyUnlocked
}

export function equipOutfit(outfitId: string): boolean {
  const unlocked = getUnlockedOutfits()
  if (!unlocked.includes(outfitId)) return false

  saveGlobalConfig(curr => ({
    ...curr,
    companionActiveOutfit: outfitId,
  }))

  return true
}
