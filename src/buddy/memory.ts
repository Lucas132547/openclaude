import { getGlobalConfig, saveGlobalConfig } from '../utils/config.js'

const MAX_MEMORIES = 20

const MEMORY_TRIGGERS = {
  firstLevelUp: (level: number) => `Subiu para o Nível ${level} pela primeira vez!`,
  streak7: () => 'Alcançou 7 dias seguidos de uso!',
  streak30: () => 'Incrível! 30 dias seguidos!',
  bashes100: () => 'Completou 100 comandos bash!',
  tasks50: () => 'Concluiu 50 tasks!',
  easterEgg: () => 'Encontrou um bug brilhante!',
  reroll: () => 'Mudou de aparência com um reroll!',
  rename: (name: string) => `Recebeu o nome "${name}"!`,
} as const

export type MemoryTrigger = keyof typeof MEMORY_TRIGGERS

export function addMemory(trigger: MemoryTrigger, ...args: unknown[]): void {
  const config = getGlobalConfig()
  const existing = config.companionMemory ?? []

  const memoryFn = MEMORY_TRIGGERS[trigger]
  if (!memoryFn) return
  const text = memoryFn(...(args as [never]))

  if (existing.some(m => m.text === text)) return

  const memory = {
    text,
    timestamp: Date.now(),
    trigger,
  }

  const updated = [...existing, memory].slice(-MAX_MEMORIES)

  saveGlobalConfig(curr => ({
    ...curr,
    companionMemory: updated,
  }))
}

export function getMemories(): Array<{ text: string; timestamp: number; trigger: string }> {
  const config = getGlobalConfig()
  return config.companionMemory ?? []
}

export function getRandomMemory(): string | null {
  const memories = getMemories()
  if (memories.length === 0) return null

  const memory = memories[Math.floor(Date.now() / 1000) % memories.length]!
  const date = new Date(memory.timestamp).toLocaleDateString('pt-BR')
  return `${memory.text} (${date})`
}
