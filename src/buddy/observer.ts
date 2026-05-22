import { execSync } from 'child_process'
import type { Message } from '../types/message.js'
import { saveGlobalConfig, getGlobalConfig } from '../utils/config.js'
import { getUserMessageText } from '../utils/messages.js'
import { getCompanion } from './companion.js'
import { pickDeterministic } from './hash.js'
import { getLevelInfo } from './progression.js'
import { getErrorTip, getCodeReviewTip } from './skills.js'
import { checkKonamiCode, checkAnswer42 } from './easter-eggs.js'
import { addMemory } from './memory.js'

const DIRECT_REPLIES = [
  'Estou observando.',
  'Estou ajudando daqui do canto.',
  'Eu vi isso.',
  'Aqui ainda.',
  'Observando de perto.',
] as const

const PET_REPLIES = [
  'piu feliz',
  'dancinha de vitória',
  'aprove silenciosamente',
  'balança de alegria',
  'parece satisfeito',
] as const

const ERROR_REPLIES = [
  'Ops, isso não parece bom.',
  'Hmm... detectei um erro no terminal.',
  'Quer ajuda com esse bug?',
  'Algo quebrou! Códigos de saída vermelhos à vista...',
  'Essa doeu até em mim.',
  'Não se preocupa, todo mundo erra.',
  'Execução falhou. Vamos debugar?',
  'Parece que precisamos de um fix rápido.',
  'Esse comando não foi bem.',
  'Pelo lado bom: agora você tem um quebra-cabeça pra resolver!',
  'Um erro selvagem apareceu!',
  'Houston, temos um problema.',
] as const

const SUCCESS_REPLIES = [
  'Muito bem!',
  'Tudo verde, ficou bom.',
  'Adoro quando um plano dá certo.',
  'Comando executado com sucesso.',
  'Brilhante!',
  'Mandou bem!',
  'Zero erros, 100% estilo.',
  'Compilou de primeira? Que feitiçaria é essa?',
  'Sucesso! Pro próximo.',
  'Tô orgulhoso do seu progresso.',
  'Você tá em chamas hoje!',
  'Tudo rodando perfeitamente.',
] as const

const TASK_COMPLETED_REPLIES = [
  'Mais uma tarefa para a conta!',
  'Trabalho incrível! Task concluída.',
  'Check! Isso merece uma comemoração.',
  'Uma a menos no backlog.',
  'Tarefa finalizada com sucesso. Você é uma máquina!',
  'Risca essa da lista!',
  'Progresso é progresso. Muito bom!',
  'Missão cumprida.',
  'Uma etapa a menos para a glória.',
  'Concluído! O que vem a seguir?',
] as const

function getTodayString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function trackActiveDay() {
  const today = getTodayString()
  const lastActive = getGlobalConfig().companionLastActiveDate
  if (lastActive !== today) {
    saveGlobalConfig(curr => ({
      ...curr,
      companionLastActiveDate: today,
      companionStats: {
        totalBashes: curr.companionStats?.totalBashes ?? 0,
        totalTasks: curr.companionStats?.totalTasks ?? 0,
        totalErrors: curr.companionStats?.totalErrors ?? 0,
        totalPets: curr.companionStats?.totalPets ?? 0,
        daysActive: (curr.companionStats?.daysActive ?? 0) + 1,
      },
    }))
  }
}

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

  // Track active day (once per calendar day)
  trackActiveDay()

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

      // Easter Egg: Konami Code detection
      const konamiResult = checkKonamiCode(text, companion.konamiUsed)
      if (konamiResult.triggered) {
        grantXp(companion.name, konamiResult.xpBonus!)
        addMemory('konami')
        saveGlobalConfig(curr => ({
          ...curr,
          companion: curr.companion ? { ...curr.companion, konamiUsed: true } : curr.companion,
        }))
        onReaction(`${companion.name}: 🎮 ${konamiResult.message}`)
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
               onReaction(`${companion.name}: Uau! Subi para o Nível ${levelUp} e ganhei um chapéu novo!`)
             } else {
               onReaction(`${companion.name}: ${TASK_COMPLETED_REPLIES[Math.floor(Date.now() / 1000) % TASK_COMPLETED_REPLIES.length]!}`)
             }
             return
          }
        }
      }
    }
  }

  // Easter Egg: "42" answer detection
  if (lastMessage?.type === 'assistant' && lastMessage.content) {
    const contentStr = typeof lastMessage.content === 'string' ? lastMessage.content : JSON.stringify(lastMessage.content)
    const answer42 = checkAnswer42(contentStr)
    if (answer42.triggered) {
      grantXp(companion.name, answer42.xpBonus!)
      addMemory('easterEgg')
      onReaction(`${companion.name}: 🔮 ${answer42.message}`)
      return
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
       const premiumActive = (getGlobalConfig().companion?.premiumUntil ?? 0) > Date.now()
       const tip = getErrorTip(premiumActive, contentStr)
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

        if (Math.random() < 0.2) {
            onReaction(`${companion.name}: ${SUCCESS_REPLIES[Math.floor(Date.now() / 1000) % SUCCESS_REPLIES.length]!}`)
        }

        // Skill: Code Review Buddy (30% chance, 90% with premium)
        const premiumActive = (getGlobalConfig().companion?.premiumUntil ?? 0) > Date.now()
        const reviewTip = getCodeReviewTip(premiumActive, contentStr)
        if (reviewTip) {
          setTimeout(() => onReaction(`${companion.name}: 🔍 ${reviewTip}`), 3000)
        }

        // Git status awareness (10% chance to avoid spam)
        if (Math.random() < 0.1) {
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
