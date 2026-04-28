import type { LocalJSXCommandContext, LocalJSXCommandOnDone } from '../../types/command.js'
import { getGlobalConfig, saveGlobalConfig } from '../../utils/config.js'
import { getLevelInfo } from '../../buddy/progression.js'
import { companionUserId, getCompanion, rollWithSeed } from '../../buddy/companion.js'
import type { StoredCompanion } from '../../buddy/types.js'
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

function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function pickDeterministic<T>(items: readonly T[], seed: string): T {
  return items[hashString(seed) % items.length]!
}

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
    'Usage: /buddy [status|mute|unmute]\n\nRun /buddy with no args to hatch your companion the first time, then pet it on later runs.',
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

  if (COMMON_HELP_ARGS.includes(arg)) {
    showHelp(onDone)
    return null
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
    onDone(
      `Name: ${companion.name} (${titleCase(companion.rarity)} ${companion.species})
Level: ${levelInfo.level} (${xp} XP)
State: ${mutedStatus}
Personality: ${companion.personality}
Mood: "${levelInfo.status}"`,
      { display: 'system' },
    )
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

    const newName = restArgs.join(' ')
    if (!newName) {
      onDone('Usage: /buddy rename <new name>\nCost: 2 XP, Requires Level 2', { display: 'system' })
      return null
    }

    const xp = companion.xp ?? 0
    const levelInfo = getLevelInfo(xp)

    // 1. Check if the user meets the level requirement (Level >= 2). If not, call onDone with an error message and return null.
    if (levelInfo.level < 2) {
      onDone(`Your buddy needs to be at least Level 2 to be renamed. (Current: Level ${levelInfo.level})`, { display: 'system' })
      return null
    }

    // 2. Check if the user has enough XP (xp >= 2). If not, call onDone with an error message and return null.
    if (xp < 2) {
      onDone(`Renaming costs 2 XP. You only have ${xp} XP.`, { display: 'system' })
      return null
    }

    // 3. Update the global config using saveGlobalConfig
    saveGlobalConfig(current => ({
      ...current,
      companion: current.companion ? {
        ...current.companion,
        name: titleCase(newName),
        xp: xp - 2,
      } : undefined,
    }))

    // 4. Set a reaction and call onDone with a success message.
    setCompanionReaction(context, `*happy noises* I like my new name!`, true)
    onDone(`Successfully renamed your buddy to ${titleCase(newName)}! (Cost: 2 XP)`, { display: 'system' })
    return null
  }

  if (baseCommand === 'reroll') {
    const companion = getCompanion()
    if (!companion) {
      onDone('No buddy hatched yet. Run /buddy to hatch one.', { display: 'system' })
      return null
    }

    const xp = companion.xp ?? 0

    // 1. Check if the user has enough XP (xp >= 10). If not, call onDone with an error message and return null.
    if (xp < 10) {
      onDone(`Rerolling costs 10 XP. You only have ${xp} XP.`, { display: 'system' })
      return null
    }

    // 2. Create a new random seed.
    const newSeed = Math.random().toString(36).substring(7)

    // 3. Update the global config using saveGlobalConfig
    saveGlobalConfig(current => ({
      ...current,
      companion: current.companion ? {
        ...current.companion,
        xp: xp - 10,
        seed: newSeed,
      } : undefined,
    }))

    // 4. Set a reaction and call onDone with a success message.
    setCompanionReaction(context, `*poof* I feel different!`, true)
    onDone(`Successfully rerolled your buddy! (Cost: 10 XP). Run /buddy status to see the changes.`, { display: 'system' })
    return null
  }

  // --- END NEW COMMANDS ---

  if (arg === 'mute' || arg === 'unmute') {
    const muted = arg === 'mute'
    saveGlobalConfig(current => ({
      ...current,
      companionMuted: muted,
    }))
    if (muted) {
      setCompanionReaction(context, undefined)
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
    } as import('../../buddy/types.js').Companion
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

  const reaction = `${companion.name} ${pickDeterministic(
    PET_REACTIONS,
    `${Date.now()}:${companion.name}`,
  )}`
  setCompanionReaction(context, reaction, true)
  onDone(undefined, { display: 'skip' })
  return null
}
