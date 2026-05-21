import type { LocalJSXCommandContext, LocalJSXCommandOnDone } from '../../types/command.js'
import { getGlobalConfig, saveGlobalConfig } from '../../utils/config.js'
import { getLevelInfo } from '../../buddy/progression.js'
import { companionUserId, getCompanion, rollWithSeed } from '../../buddy/companion.js'
import type { StoredCompanion, Companion } from '../../buddy/types.js'
import { pickDeterministic } from '../../buddy/hash.js'
import { processStreak } from '../../buddy/streak.js'
import { getMood } from '../../buddy/mood.js'
import { getSessionSummary } from '../../buddy/skills.js'
import { addReminder } from '../../buddy/reminders.js'
import { OUTFITS, getUnlockedOutfits, getActiveOutfit, equipOutfit, checkAndUnlockOutfits } from '../../buddy/outfits.js'
import { addMemory, getMemories } from '../../buddy/memory.js'
import { COMMON_HELP_ARGS, COMMON_INFO_ARGS } from '../../constants/xml.js'

const NAME_PREFIXES = [
  'Byte',
  'Echo',
  'Glint',
  'Miso',
  'Nova',
  'Pixel',
  'Rune',
  'Static',
  'Vector',
  'Whisk',
] as const

const NAME_SUFFIXES = [
  'bean',
  'bit',
  'bud',
  'dot',
  'ling',
  'loop',
  'moss',
  'patch',
  'puff',
  'spark',
] as const

const PERSONALITIES = [
  'Curious and quietly encouraging',
  'A patient little watcher with strong debugging instincts',
  'Playful, observant, and suspicious of flaky tests',
  'Calm under pressure and fond of clean diffs',
  'A tiny terminal gremlin who likes successful builds',
] as const

const PET_REACTIONS = [
  'leans into the headpat',
  'does a proud little bounce',
  'emits a content beep',
  'looks delighted',
  'wiggles happily',
] as const

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function createStoredCompanion(): StoredCompanion {
  const userId = companionUserId()
  const { bones } = rollWithSeed(`${userId}:buddy`)
  const prefix = pickDeterministic(NAME_PREFIXES, `${userId}:prefix`)
  const suffix = pickDeterministic(NAME_SUFFIXES, `${userId}:suffix`)
  const personality = pickDeterministic(PERSONALITIES, `${userId}:personality`)

  return {
    name: `${prefix}${suffix}`,
    personality: `${personality}.`,
    hatchedAt: Date.now(),
  }
}

function setCompanionReaction(
  context: LocalJSXCommandContext,
  reaction: string | undefined,
  pet = false,
): void {
  context.setAppState(prev => ({
    ...prev,
    companionReaction: reaction,
    companionPetAt: pet ? Date.now() : prev.companionPetAt,
  }))
}

function showHelp(onDone: LocalJSXCommandOnDone): void {
  onDone(
    'Usage: /buddy [status|mute|unmute|rename|reroll|brincar|alimentar|stats|outfits|equipar|resumo|lembrar|memorias|help]\n\nRun /buddy with no args to hatch your companion the first time, then pet it on later runs.\n\nXP Sources:\n  Bash success: +0.1 XP\n  Daily pet: +1 XP (first /buddy of the day)\n  Task completed: +3 XP\n  Alimentar: +0.5 XP (cooldown: 1h)\n\nCommands:\n  /buddy rename <name> — Cost: 5 XP, Requires Level 2\n  /buddy reroll — Cost: 15 XP\n  /buddy brincar — Brinque com seu buddy (cooldown: 1h)\n  /buddy alimentar — Alimente seu buddy (+0.5 XP, cooldown: 1h)\n  /buddy stats — Mostra estatísticas do buddy\n  /buddy resumo — Resumo da sessão (Level 4+)\n  /buddy outfits — Veja os outfits disponíveis\n  /buddy equipar <nome> — Equipe um outfit\n  /buddy lembrar <min> <texto> — Define um lembrete\n  /buddy memorias — Veja as memórias do seu buddy',
    { display: 'system' },
  )
}

export async function call(
  onDone: LocalJSXCommandOnDone,
  context: LocalJSXCommandContext,
  args?: string,
): Promise<null> {
  const arg = args?.trim().toLowerCase() ?? ''

  if (COMMON_HELP_ARGS.includes(arg) || arg === '') {
    const existing = getCompanion()
    if (arg !== '' || existing) {
      if (arg !== '') {
        showHelp(onDone)
        return null
      }
    }
  }

  if (COMMON_INFO_ARGS.includes(arg) || arg === 'status') {
    const companion = getCompanion()
    if (!companion) {
      onDone('No buddy hatched yet. Run /buddy to hatch one.', {
        display: 'system',
      })
      return null
    }
    const xp = companion.xp ?? 0
    const levelInfo = getLevelInfo(xp)
    const mutedStatus = getGlobalConfig().companionMuted ? 'Muted' : 'Listening'
    const xpDisplay = xp % 1 === 0 ? xp.toString() : xp.toFixed(1)
    const mood = getMood()
    onDone(
      `Name: ${companion.name} (${titleCase(companion.rarity)} ${companion.species})
Level: ${levelInfo.level} (${xpDisplay} XP)
State: ${mutedStatus}
Personality: ${companion.personality}
Mood: ${mood.emoji} "${mood.text}"`,
      { display: 'system' },
    )
    return null
  }

  if (arg === 'stats') {
    const companion = getCompanion()
    if (!companion) {
      onDone('Nenhum buddy ainda. Use /buddy para criar um.', { display: 'system' })
      return null
    }

    const config = getGlobalConfig()
    const stats = config.companionStats ?? { totalBashes: 0, totalTasks: 0, totalErrors: 0, totalPets: 0, daysActive: 0 }
    const xp = companion.xp ?? 0
    const levelInfo = getLevelInfo(xp)
    const streak = config.companionStreakCount ?? 0

    onDone(
      `📊 Estatísticas do ${companion.name}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Level: ${levelInfo.level} (${xp} XP)\n` +
      `Streak: ${streak} dias\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Comandos executados: ${stats.totalBashes}\n` +
      `Tasks concluídas: ${stats.totalTasks}\n` +
      `Erros encontrados: ${stats.totalErrors}\n` +
      `Pets recebidos: ${stats.totalPets}\n` +
      `Dias ativos: ${stats.daysActive}`,
      { display: 'system' },
    )
    return null
  }

  if (arg === 'resumo') {
    const summary = getSessionSummary()
    if (!summary) {
      onDone('Seu buddy precisa estar no Level 4 para dar resumos.', { display: 'system' })
      return null
    }
    onDone(summary, { display: 'system' })
    return null
  }

  if (arg.startsWith('lembrar ')) {
    const companion = getCompanion()
    if (!companion) {
      onDone('Nenhum buddy ainda. Use /buddy para criar um.', { display: 'system' })
      return null
    }

    const lembrarArgs = arg.slice('lembrar '.length)
    const parts = lembrarArgs.match(/^(\d+)\s+(.+)$/)
    if (!parts) {
      onDone('Uso: /buddy lembrar <minutos> <texto>\nExemplo: /buddy lembrar 10 revisar PR', { display: 'system' })
      return null
    }

    const minutes = parseInt(parts[1]!)
    const text = parts[2]!.trim()

    if (minutes < 1 || minutes > 1440) {
      onDone('O tempo deve ser entre 1 e 1440 minutos (24 horas).', { display: 'system' })
      return null
    }

    if (!text) {
      onDone('Preciso de um texto para o lembrete.', { display: 'system' })
      return null
    }

    addReminder(minutes, text)
    onDone(`${companion.name}: Beleza! Vou te lembrar em ${minutes} minuto${minutes > 1 ? 's' : ''}: "${text}"`, { display: 'system' })
    return null
  }

  if (arg === 'memorias') {
    const companion = getCompanion()
    if (!companion) {
      onDone('Nenhum buddy ainda. Use /buddy para criar um.', { display: 'system' })
      return null
    }

    const memories = getMemories()
    if (memories.length === 0) {
      onDone(`${companion.name} ainda não tem memórias.`, { display: 'system' })
      return null
    }

    const list = memories
      .map(m => {
        const date = new Date(m.timestamp).toLocaleDateString('pt-BR')
        return `  • ${m.text} (${date})`
      })
      .join('\n')

    onDone(`🧠 Memórias do ${companion.name}:\n${list}`, { display: 'system' })
    return null
  }

  // --- BEGIN NEW COMMANDS: RENAME & REROLL ---

  const [baseCommand, ...restArgs] = arg.split(' ')

  if (baseCommand === 'rename') {
    const companion = getCompanion()
    if (!companion) {
      onDone('No buddy hatched yet. Run /buddy to hatch one.', { display: 'system' })
      return null
    }

    const newName = restArgs.join(' ').trim()
    if (!newName || newName.length > 30) {
      onDone('Usage: /buddy rename <new name>\nName must be between 1 and 30 characters.\nCost: 5 XP, Requires Level 2', { display: 'system' })
      return null
    }

    const xp = companion.xp ?? 0
    const levelInfo = getLevelInfo(xp)

    if (levelInfo.level < 2) {
      onDone(`Your buddy needs to be at least Level 2 to be renamed. (Current: Level ${levelInfo.level})`, { display: 'system' })
      return null
    }

    if (xp < 5) {
      onDone(`Renaming costs 5 XP. You only have ${xp} XP.`, { display: 'system' })
      return null
    }

    saveGlobalConfig(current => ({
      ...current,
      companion: current.companion ? {
        ...current.companion,
        name: titleCase(newName),
        xp: xp - 5,
      } : undefined,
    }))

    addMemory('rename', titleCase(newName))
    setCompanionReaction(context, `*happy noises* I like my new name!`, true)
    onDone(`Successfully renamed your buddy to ${titleCase(newName)}! (Cost: 5 XP)`, { display: 'system' })
    return null
  }

  if (baseCommand === 'reroll') {
    const companion = getCompanion()
    if (!companion) {
      onDone('No buddy hatched yet. Run /buddy to hatch one.', { display: 'system' })
      return null
    }

    const xp = companion.xp ?? 0

    if (xp < 15) {
      onDone(`Rerolling costs 15 XP. You only have ${xp} XP.`, { display: 'system' })
      return null
    }

    const newSeed = Math.random().toString(36).substring(7)

    saveGlobalConfig(current => ({
      ...current,
      companion: current.companion ? {
        ...current.companion,
        xp: xp - 15,
        seed: newSeed,
      } : undefined,
    }))

    addMemory('reroll')
    setCompanionReaction(context, `*poof* I feel different!`, true)
    onDone(`Successfully rerolled your buddy! (Cost: 15 XP). Run /buddy status to see the changes.`, { display: 'system' })
    return null
  }

  // --- END NEW COMMANDS ---

  // Pet interactivo — brincar
  if (arg === 'brincar') {
    const companion = getCompanion()
    if (!companion) {
      onDone('Nenhum buddy ainda. Use /buddy para criar um.', { display: 'system' })
      return null
    }

    const config = getGlobalConfig()
    const lastBrincar = config.companionLastAction?.brincar ?? 0
    const now = Date.now()
    const cooldown = 60 * 60 * 1000 // 1 hora

    if (now - lastBrincar < cooldown) {
      const remaining = Math.ceil((cooldown - (now - lastBrincar)) / 60000)
      onDone(`${companion.name} ainda está cansado da última brincadeira. Tente novamente em ${remaining} minutos.`, { display: 'system' })
      return null
    }

    const reactions = [
      `${companion.name} corre em círculos felizes! 🎾`,
      `${companion.name} pula de alegria! 🦘`,
      `${companion.name} faz uma dança engraçada! 💃`,
      `${companion.name} rola no chão de barriga pra cima! 🤸`,
      `${companion.name} brinca de esconde-esconde! 🫣`,
    ]
    const reaction = reactions[Math.floor(Date.now() / 1000) % reactions.length]!

    saveGlobalConfig(current => ({
      ...current,
      companionLastAction: {
        ...current.companionLastAction,
        brincar: now,
      },
    }))

    setCompanionReaction(context, reaction, true)
    onDone(undefined, { display: 'skip' })
    return null
  }

  // Pet interactivo — alimentar
  if (arg === 'alimentar') {
    const companion = getCompanion()
    if (!companion) {
      onDone('Nenhum buddy ainda. Use /buddy para criar um.', { display: 'system' })
      return null
    }

    const config = getGlobalConfig()
    const lastAlimentar = config.companionLastAction?.alimentar ?? 0
    const now = Date.now()
    const cooldown = 60 * 60 * 1000 // 1 hora

    if (now - lastAlimentar < cooldown) {
      const remaining = Math.ceil((cooldown - (now - lastAlimentar)) / 60000)
      onDone(`${companion.name} não está com fome agora. Tente novamente em ${remaining} minutos.`, { display: 'system' })
      return null
    }

    const reactions = [
      `${companion.name} come com vontade! Yum! 🍕`,
      `${companion.name} saboreia o lanche! 😋`,
      `${companion.name} lambe os beiços! 🤤`,
      `${companion.name} faz uma refeição deliciosa! 🍽️`,
    ]
    const reaction = reactions[Math.floor(Date.now() / 1000) % reactions.length]!

    // +0.5 XP por alimentar
    const xp = companion.xp ?? 0
    const newXp = Math.round((xp + 0.5) * 10) / 10

    saveGlobalConfig(current => ({
      ...current,
      companionLastAction: {
        ...current.companionLastAction,
        alimentar: now,
      },
      companion: current.companion ? {
        ...current.companion,
        xp: newXp,
      } : undefined,
    }))

    setCompanionReaction(context, reaction, true)
    onDone(undefined, { display: 'skip' })
    return null
  }

  if (arg === 'outfits') {
    const companion = getCompanion()
    if (!companion) {
      onDone('Nenhum buddy ainda. Use /buddy para criar um.', { display: 'system' })
      return null
    }

    const unlocked = getUnlockedOutfits()
    const active = getActiveOutfit()

    const list = OUTFITS.map(o => {
      const isUnlocked = unlocked.includes(o.id)
      const isActive = active === o.id
      const status = isActive ? ' ✅ (equipado)' : isUnlocked ? ' 🔓' : ' 🔒'
      return `  ${status} ${o.name} — ${o.description}${!isUnlocked ? `\n      Requisito: ${o.requirement}` : ''}`
    }).join('\n')

    onDone(`🎨 Outfits do ${companion.name}:\n${list}`, { display: 'system' })
    return null
  }

  if (baseCommand === 'equipar') {
    const companion = getCompanion()
    if (!companion) {
      onDone('Nenhum buddy ainda. Use /buddy para criar um.', { display: 'system' })
      return null
    }

    const outfitName = restArgs.join(' ').trim().toLowerCase()
    if (!outfitName) {
      onDone('Uso: /buddy equipar <nome do outfit>\nVeja os outfits disponíveis com /buddy outfits', { display: 'system' })
      return null
    }

    const outfit = OUTFITS.find(o => o.name.toLowerCase() === outfitName || o.id === outfitName)
    if (!outfit) {
      onDone(`Outfit "${outfitName}" não encontrado. Use /buddy outfits para ver os disponíveis.`, { display: 'system' })
      return null
    }

    if (!equipOutfit(outfit.id)) {
      onDone(`${outfit.name} ainda não foi desbloqueado! Requisito: ${outfit.requirement}`, { display: 'system' })
      return null
    }

    setCompanionReaction(context, `${companion.name}: Uau! Estou usando o outfit ${outfit.name}!`, true)
    onDone(`Outfit ${outfit.name} equipado!`, { display: 'system' })
    return null
  }

  if (arg === 'mute' || arg === 'unmute') {
    const muted = arg === 'mute'
    saveGlobalConfig(current => ({
      ...current,
      companionMuted: muted,
    }))
    if (muted) {
      setCompanionReaction(context, undefined)
    } else {
      const companion = getCompanion()
      setCompanionReaction(context, `${companion?.name ?? 'Buddy'}: I'm back!`, true)
    }
    onDone(`Buddy ${muted ? 'muted' : 'unmuted'}.`, { display: 'system' })
    return null
  }

  if (arg !== '') {
    showHelp(onDone)
    return null
  }

  let companion = getCompanion()
  if (!companion) {
    const stored = createStoredCompanion()
    saveGlobalConfig(current => ({
      ...current,
      companion: stored,
      companionMuted: false,
    }))
    const bones = rollWithSeed(`${companionUserId()}:buddy`).bones
    companion = {
      ...bones,
      ...stored,
      hat: stored.hat ?? bones.hat,
    } as Companion
    setCompanionReaction(
      context,
      `${companion.name} the ${companion.species} has hatched.`,
      true,
    )
    onDone(
      `${companion.name} the ${companion.species} is now your buddy. Run /buddy again to pet them.`,
      { display: 'system' },
    )
    return null
  }

  // Increment pet count
  saveGlobalConfig(current => ({
    ...current,
    companionStats: {
      totalBashes: current.companionStats?.totalBashes ?? 0,
      totalTasks: current.companionStats?.totalTasks ?? 0,
      totalErrors: current.companionStats?.totalErrors ?? 0,
      totalPets: (current.companionStats?.totalPets ?? 0) + 1,
      daysActive: current.companionStats?.daysActive ?? 0,
    },
  }))

  const reaction = `${companion.name} ${pickDeterministic(
    PET_REACTIONS,
    `${Date.now()}:${companion.name}`,
  )}`

  // Daily pet XP: +1 XP for the first pet of the day
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const lastPetDate = getGlobalConfig().companionLastPetDate
  if (lastPetDate !== today) {
    const xp = companion.xp ?? 0
    const newXp = Math.round((xp + 1) * 10) / 10
    const oldInfo = getLevelInfo(xp)
    const newInfo = getLevelInfo(newXp)

    saveGlobalConfig(current => ({
      ...current,
      companionLastPetDate: today,
      companion: current.companion ? {
        ...current.companion,
        xp: newXp,
        hat: newInfo.hat ?? current.companion.hat,
      } : undefined,
    }))

    if (oldInfo.level !== newInfo.level) {
      onDone(`${reaction}\n${companion.name}: Wow! I leveled up to Level ${newInfo.level} and got a new hat!`, { display: 'system' })
      return null
    }
  }

  // Streak diário
  const streakResult = processStreak()
  if (streakResult.bonusXp > 0) {
    const xp = getGlobalConfig().companion?.xp ?? 0
    const newXp = Math.round((xp + streakResult.bonusXp) * 10) / 10
    saveGlobalConfig(current => ({
      ...current,
      companion: current.companion ? { ...current.companion, xp: newXp } : undefined,
    }))
  }
  if (streakResult.streak === 7) addMemory('streak7')
  if (streakResult.streak === 30) addMemory('streak30')

  // Easter egg: 0.5% chance de bônus especial
  if (Math.random() < 0.005) {
    const xp = getGlobalConfig().companion?.xp ?? 0
    const newXp = Math.round((xp + 5) * 10) / 10
    saveGlobalConfig(current => ({
      ...current,
      companion: current.companion ? { ...current.companion, xp: newXp } : undefined,
    }))
    addMemory('easterEgg')
    onDone(`✨ ${companion.name} encontrou um bug brilhante escondido! +5 XP bônus!`, { display: 'system' })
    return null
  }

  // Check for newly unlocked outfits
  const newOutfits = checkAndUnlockOutfits()
  if (newOutfits.length > 0) {
    const streakMsg = streakResult.message ? `\n${streakResult.message}` : ''
    onDone(`${reaction}${streakMsg}\n🎨 Novo outfit desbloqueado: ${newOutfits.join(', ')}!`, { display: 'system' })
    return null
  }

  const streakMsg = streakResult.message ? `\n${streakResult.message}` : ''
  setCompanionReaction(context, reaction + streakMsg, true)
  onDone(undefined, { display: 'skip' })
  return null
}
