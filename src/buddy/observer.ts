import { execSync } from 'child_process'
import type { Message } from '../types/message.js'
import { saveGlobalConfig, getGlobalConfig } from '../utils/config.js'
import { getUserMessageText } from '../utils/messages.js'
import { getCompanion } from './companion.js'
import { pickDeterministic } from './hash.js'
import { getLevelInfo } from './progression.js'
import { getErrorTip } from './skills.js'
import { addMemory } from './memory.js'

const DIRECT_REPLIES = [
  'I am observing.',
  'I am helping from the corner.',
  'I saw that.',
  'Still here.',
  'Watching closely.',
] as const

const PET_REPLIES = [
  'happy chirp',
  'tiny victory dance',
  'quietly approves',
  'wiggles with joy',
  'looks pleased',
] as const

const ERROR_REPLIES = [
  'Oops, that doesn\'t look good.',
  'Hmm... detected an error in the terminal.',
  'Want a hand with that bug?',
  'Something broke! Red exit codes ahead...',
  'Ouch, that one hurt even me.',
  'Don\'t worry, everyone makes mistakes.',
  'Execution failed. Let\'s debug?',
  'Looks like we need a quick fix.',
  'That command didn\'t go well.',
  'Look on the bright side: now you have a puzzle to solve!',
  'A wild error appeared!',
  'Houston, we have a problem.',
] as const

const SUCCESS_REPLIES = [
  'Nice one!',
  'All green, looking good.',
  'Love it when a plan comes together.',
  'Command executed successfully.',
  'Brilliant!',
  'Well done!',
  'Zero errors, 100% style.',
  'Code compiled on the first try? What sorcery is this?',
  'Success! On to the next one.',
  'I\'m proud of your progress.',
  'You\'re on fire today!',
  'Everything running perfectly.',
] as const

const TASK_COMPLETED_REPLIES = [
  'One more task for the books!',
  'Incredible work! Task completed.',
  'Check! That deserves a celebration.',
  'One less in the backlog.',
  'Task finished successfully. You\'re a machine!',
  'Cross that one off the list!',
  'Progress is progress. Well done!',
  'Mission accomplished.',
  'One step closer to glory.',
  'Done! What\'s next?',
] as const

function incrementStat(stat: 'totalBashes' | 'totalTasks' | 'totalErrors') {
  saveGlobalConfig(curr => ({
    ...curr,
    companionStats: {
      totalBashes: curr.companionStats?.totalBashes ?? 0,
      totalTasks: curr.companionStats?.totalTasks ?? 0,
      totalErrors: curr.companionStats?.totalErrors ?? 0,
      totalPets: curr.companionStats?.totalPets ?? 0,
      daysActive: curr.companionStats?.daysActive ?? 0,
      [stat]: (curr.companionStats?.[stat] ?? 0) + 1,
    },
  }))
}

function grantXp(companionName: string, amount: number): number | null {
  let newLevel: number | null = null

  saveGlobalConfig(curr => {
    if (!curr.companion) return curr

    const currentXp = curr.companion.xp ?? 0
    const newXp = Math.round((currentXp + amount) * 10) / 10
    const oldInfo = getLevelInfo(currentXp)
    const newInfo = getLevelInfo(newXp)

    if (oldInfo.level !== newInfo.level) {
      newLevel = newInfo.level
    }

    return {
      ...curr,
      companion: {
        ...curr.companion,
        xp: newXp,
        hat: newInfo.hat ?? curr.companion.hat
      }
    }
  })

  return newLevel
}

export async function fireCompanionObserver(
  messages: Message[],
  onReaction: (reaction: string | undefined) => void,
): Promise<void> {
  const companion = getCompanion()
  if (!companion || getGlobalConfig().companionMuted) return

  // 1. Process explicit user interactions first
  const lastUser = [...messages].reverse().find(msg => msg.type === 'user')
  if (lastUser) {
    const text = getUserMessageText(lastUser)?.trim()
    if (text) {
      const lower = text.toLowerCase()
      const companionName = companion.name.toLowerCase()

      if (lower.includes('/buddy')) {
        onReaction(pickDeterministic(PET_REPLIES, text + companion.name))
        return
      }

      if (
        lower.includes(companionName) ||
        lower.includes('buddy') ||
        lower.includes('companion')
      ) {
        onReaction(
          `${companion.name}: ${pickDeterministic(DIRECT_REPLIES, text + companion.personality)}`,
        )
        return
      }
    }
  }

  // 2. Process tool results for contextual reactions
  // Look at the last message. If it's a tool_result or assistant message, we check for status.
  const lastMessage = messages[messages.length - 1]

  if (lastMessage?.type === 'assistant') {
    // Check if the assistant just called TaskUpdate with status: completed
    if (lastMessage.content && Array.isArray(lastMessage.content)) {
      for (const content of lastMessage.content) {
        if (content.type === 'tool_use' && content.name === 'TaskUpdate') {
          const input = content.input
          if (typeof input === 'object' && input !== null && 'status' in input && input.status === 'completed') {
             // XP Logic — Task completed: +3 XP
             incrementStat('totalTasks')
             const levelUp = grantXp(companion.name, 3)
             const taskStats = getGlobalConfig().companionStats
             if (taskStats && taskStats.totalTasks === 50) addMemory('tasks50')
             if (levelUp) {
               onReaction(`${companion.name}: Wow! I leveled up to Level ${levelUp} and got a new hat!`)
             } else {
               onReaction(`${companion.name}: ${TASK_COMPLETED_REPLIES[Math.floor(Date.now() / 1000) % TASK_COMPLETED_REPLIES.length]!}`)
             }
             return
          }
        }
      }
    }
  }

  if (lastMessage?.type === 'tool_result' && lastMessage.content) {
    const isError = lastMessage.is_error

    // Check if it's a Bash command that failed (they don't always have is_error: true, but might have Error in output)
    const contentStr = typeof lastMessage.content === 'string' ? lastMessage.content : JSON.stringify(lastMessage.content)

    const isBashFailure = lastMessage.name === 'Bash' &&
      (contentStr.includes('Error: Exit code') || contentStr.includes('Command failed'));

    if (isError || isBashFailure) {
       incrementStat('totalErrors')
       onReaction(`${companion.name}: ${ERROR_REPLIES[Math.floor(Date.now() / 1000) % ERROR_REPLIES.length]!}`)
       // Skill: dica contextual (Level 2+)
       const tip = getErrorTip()
       if (tip) {
         setTimeout(() => onReaction(`${companion.name}: 💡 ${tip}`), 2000)
       }
       return
    }

    // Occasional success reaction (approx 20% chance on successful Bash/tool execution)
    if (lastMessage.name === 'Bash' && !isError && !isBashFailure) {
        // Bash success: +0.1 XP
        incrementStat('totalBashes')
        grantXp(companion.name, 0.1)
        const bashStats = getGlobalConfig().companionStats
        if (bashStats && bashStats.totalBashes === 100) addMemory('bashes100')

        if (Date.now() % 5 === 0) {
            onReaction(`${companion.name}: ${SUCCESS_REPLIES[Math.floor(Date.now() / 1000) % SUCCESS_REPLIES.length]!}`)
        }

        // Git status awareness (10% chance to avoid spam)
        if (Date.now() % 10 === 0) {
            try {
              const gitStatus = execSync('git status --porcelain 2>/dev/null', { encoding: 'utf8', timeout: 2000 }).trim()
              const uncommittedCount = gitStatus ? gitStatus.split('\n').length : 0

              if (uncommittedCount > 10) {
                onReaction(`${companion.name}: Você tem ${uncommittedCount} arquivos não commitados... talvez seja hora de um commit?`)
                return
              }
            } catch {
              // Not in a git repo or git not available — ignore
            }

            try {
              const behind = execSync('git rev-list --count HEAD..@{upstream} 2>/dev/null', { encoding: 'utf8', timeout: 2000 }).trim()
              if (behind && parseInt(behind) > 5) {
                onReaction(`${companion.name}: Sua branch está ${behind} commits atrás do remote. Hora de dar pull!`)
                return
              }
            } catch {
              // No upstream or not in git repo — ignore
            }
        }
    }
  }
}
