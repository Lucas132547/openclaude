import { execSync } from 'child_process'
import type { Message } from '../types/message.js'
import type { FeedbackDetectionResult } from '../hooks/feedbackHook.js'
import { saveGlobalConfig, getGlobalConfig } from '../utils/config.js'
import { getUserMessageText } from '../utils/messages.js'
import { getCompanion } from './companion.js'
import { pickDeterministic } from './hash.js'
import { getLevelInfo } from './progression.js'
import { getErrorTip, getCodeReviewTip } from './skills.js'
import { checkKonamiCode, checkAnswer42 } from './easter-eggs.js'
import { addMemory } from './memory.js'
import { getTodayQuests, getTodayString as getQuestTodayString } from './quests.js'
import type { Quest } from './quests.js'

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

const FEEDBACK_CORRECTION_REPLIES = [
  'Hmm, vou anotar isso para nao errar de novo...',
  'Entendi! Deixa eu registrar essa regra.',
  'Opa, correcao recebida. Aprendendo!',
  'Puxa, desculpe! Vou memorizar isso.',
] as const

const FEEDBACK_UNDO_REPLIES = [
  'Ops, desfiz algo errado? Vou anotar.',
  'Revertido! Vou lembrar da proxima vez.',
] as const

const FEEDBACK_CONFIRM_REPLIES = [
  'Regra consolidada! +2 XP',
  'Aprendizado confirmado! Estou mais inteligente agora.',
  'Memoria fortalecida! Obrigado por confirmar.',
] as const

const STONEAGE_REPLIES = [
  'Pedra afiada. Resposta menor.',
  'Gravuras na caverna. Código compacto.',
  'Fogo bom. Menos palavras, mais ação.',
  'Mamute satisfeito com a economia.',
  'Rodinha redonda. Tokens economizados.',
  'Lascagem perfeita. Sobra só o essencial.',
  'Pintura rupestre: poucos traços, história completa.',
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
        totalTokensSaved: curr.companionStats?.totalTokensSaved ?? 0,
        totalFeedbackRules: curr.companionStats?.totalFeedbackRules ?? 0,
        totalFeedbackConfirms: curr.companionStats?.totalFeedbackConfirms ?? 0,
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
      totalTokensSaved: curr.companionStats?.totalTokensSaved ?? 0,
      totalFeedbackRules: curr.companionStats?.totalFeedbackRules ?? 0,
      totalFeedbackConfirms: curr.companionStats?.totalFeedbackConfirms ?? 0,
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

function checkQuests(actionType: string, payload?: string, onReaction?: (reaction: string) => void) {
  const companion = getCompanion()
  if (!companion || getGlobalConfig().companionMuted) return

  const today = getQuestTodayString()
  const quests = getTodayQuests()
  const config = getGlobalConfig()

  let questData = config.companionQuests
  if (questData?.date !== today) {
    questData = { date: today, completed: {} }
  }

  const newlyCompleted: Quest[] = []

  for (const q of quests) {
    if (questData.completed[q.id]) continue

    let isCompleted = false
    switch(q.id) {
      case 'bash_long': isCompleted = (actionType === 'bash' && payload !== undefined && payload.length > 50); break;
      case 'bash_git': isCompleted = (actionType === 'bash' && payload !== undefined && payload.startsWith('git ')); break;
      case 'bash_npm': isCompleted = (actionType === 'bash' && payload !== undefined && (payload.startsWith('npm ') || payload.startsWith('yarn ') || payload.startsWith('pnpm '))); break;
      case 'bash_error': isCompleted = (actionType === 'bash_error'); break;
      case 'task_completed': isCompleted = (actionType === 'task_completed'); break;
      case 'buddy_pet': isCompleted = (actionType === 'buddy_pet'); break;
      case 'buddy_brincar': isCompleted = (actionType === 'buddy_brincar'); break;
      case 'buddy_hidratei': isCompleted = (actionType === 'buddy_hidratei'); break;
      case 'buddy_stats': isCompleted = (actionType === 'buddy_stats'); break;
      case 'buddy_journal': isCompleted = (actionType === 'buddy_journal'); break;
      case 'buddy_outfits': isCompleted = (actionType === 'buddy_outfits'); break;
      case 'buddy_quests': isCompleted = (actionType === 'buddy_quests'); break;
    }

    if (isCompleted) {
      questData.completed[q.id] = true
      newlyCompleted.push(q)
    }
  }

  if (newlyCompleted.length > 0) {
    saveGlobalConfig(curr => ({ ...curr, companionQuests: questData }))
    for (const q of newlyCompleted) {
       grantXp(companion.name, q.xpReward)
       if (onReaction) {
         setTimeout(() => onReaction(`${companion.name}: 🎯 Quest diária concluída: "${q.description}" (+${q.xpReward} XP)`), 1500)
       }
    }
  }
}

export async function fireCompanionObserver(
  messages: Message[],
  onReaction: (reaction: string | undefined) => void,
  feedbackResult?: FeedbackDetectionResult,
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
        // Run checkQuests but ONLY trigger if it actually matches.
        // For subcommands like /buddy quests, we don't want to trigger buddy_pet.
        let isSubcommand = false

        if (lower.includes('hidratei')) { checkQuests('buddy_hidratei', undefined, onReaction); isSubcommand = true }
        else if (lower.includes('brincar')) { checkQuests('buddy_brincar', undefined, onReaction); isSubcommand = true }
        else if (lower.includes('stats')) { checkQuests('buddy_stats', undefined, onReaction); isSubcommand = true }
        else if (lower.includes('journal')) { checkQuests('buddy_journal', undefined, onReaction); isSubcommand = true }
        else if (lower.includes('outfits')) { checkQuests('buddy_outfits', undefined, onReaction); isSubcommand = true }
        else if (lower.includes('quests')) { checkQuests('buddy_quests', undefined, onReaction); isSubcommand = true }

        // If it was just '/buddy' and no subcommand matched, then it's a pet
        if (!isSubcommand) {
          checkQuests('buddy_pet', undefined, onReaction)
          onReaction(pickDeterministic(PET_REPLIES, text + companion.name))
        }

        return
      }

      // Stoneage mode detection — token compression mode
      if (/\bstoneage\b/i.test(lower)) {
        const levelUp = grantXp(companion.name, 0.5)
        saveGlobalConfig(curr => ({
          ...curr,
          companionStats: {
            totalBashes: curr.companionStats?.totalBashes ?? 0,
            totalTasks: curr.companionStats?.totalTasks ?? 0,
            totalErrors: curr.companionStats?.totalErrors ?? 0,
            totalPets: curr.companionStats?.totalPets ?? 0,
            daysActive: curr.companionStats?.daysActive ?? 0,
            totalTokensSaved: (curr.companionStats?.totalTokensSaved ?? 0) + 500,
            totalFeedbackRules: curr.companionStats?.totalFeedbackRules ?? 0,
            totalFeedbackConfirms: curr.companionStats?.totalFeedbackConfirms ?? 0,
          },
        }))
        // Check for first-time activation achievement
        const stats = getGlobalConfig().companionStats
        if (stats && (stats.totalTokensSaved ?? 0) <= 500) {
          addMemory('stoneageFirst')
        }
        if (levelUp) {
          onReaction(`${companion.name}: Uau! Subi para o Nível ${levelUp}! Stoneage ativado — economia de tokens em ação!`)
        } else {
          onReaction(`${companion.name}: ${pickDeterministic(STONEAGE_REPLIES, text + companion.name)}`)
        }
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
  // Scan recent messages (reverse) to find tool results and task completions.
  // After a tool-use loop, the message sequence is:
  //   User → Assistant(tool_use) → User(tool_result) → Assistant(text response)
  // The last message is always the assistant's text reply, so checking only
  // messages[length-1] misses all tool_results and earlier tool_use blocks.
  const recentMessages = messages.slice(-10)

  // Check for TaskUpdate status:completed in any recent assistant message
  for (let i = recentMessages.length - 1; i >= 0; i--) {
    const msg = recentMessages[i]!
    if (msg.type === 'assistant' && msg.content && Array.isArray(msg.content)) {
      for (const content of msg.content) {
        if (content.type === 'tool_use' && content.name === 'TaskUpdate') {
          const input = content.input
          if (typeof input === 'object' && input !== null && 'status' in input && input.status === 'completed') {
             // XP Logic — Task completed: +3 XP
             incrementStat('totalTasks')
             checkQuests('task_completed', undefined, onReaction)
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

  // Easter Egg: "42" answer detection (check last assistant message)
  const lastAssistant = [...recentMessages].reverse().find(m => m.type === 'assistant')
  if (lastAssistant?.type === 'assistant' && lastAssistant.content) {
    const contentStr = typeof lastAssistant.content === 'string' ? lastAssistant.content : JSON.stringify(lastAssistant.content)
    const answer42 = checkAnswer42(contentStr)
    if (answer42.triggered) {
      grantXp(companion.name, answer42.xpBonus!)
      addMemory('easterEgg')
      onReaction(`${companion.name}: 🔮 ${answer42.message}`)
      return
    }
  }

  // Scan recent tool_result messages for errors and bash success
  let foundBashSuccess = false
  let lastBashContent = ''
  for (let i = recentMessages.length - 1; i >= 0; i--) {
    const msg = recentMessages[i]!
    if (msg.type !== 'tool_result' || !msg.content) continue

    const isError = msg.is_error
    const contentStr = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)

    const isBashFailure = msg.name === 'Bash' &&
      (contentStr.includes('Error: Exit code') || contentStr.includes('Command failed'))

    if (isError || isBashFailure) {
       incrementStat('totalErrors')
       checkQuests('bash_error', undefined, onReaction)
       onReaction(`${companion.name}: ${ERROR_REPLIES[Math.floor(Date.now() / 1000) % ERROR_REPLIES.length]!}`)
       // Skill: dica contextual (85% chance, 98% premium)
       const premiumActive = (getGlobalConfig().companion?.premiumUntil ?? 0) > Date.now()
       const tip = getErrorTip(premiumActive, contentStr)
       if (tip) {
         setTimeout(() => onReaction(`${companion.name}: 💡 ${tip}`), 2000)
       }
       return
    }

<<<<<<< HEAD
    // Track successful Bash execution (first non-error bash from the end)
    if (msg.name === 'Bash' && !foundBashSuccess) {
      foundBashSuccess = true
      lastBashContent = contentStr
=======
    // Occasional success reaction (approx 20% chance on successful Bash/tool execution)
    if (lastMessage.name === 'Bash' && !isError && !isBashFailure) {
        // Bash success: +0.1 XP
        incrementStat('totalBashes')
        grantXp(companion.name, 0.1)

        let bashCommand = ''
        const toolUseMsg = messages.find(m => m.type === 'assistant' && Array.isArray(m.content) && m.content.some(c => c.type === 'tool_use' && c.id === lastMessage.tool_use_id))
        if (toolUseMsg && Array.isArray(toolUseMsg.content)) {
          const toolCall = toolUseMsg.content.find(c => c.type === 'tool_use' && c.id === lastMessage.tool_use_id)
          if (toolCall && typeof toolCall.input === 'object' && toolCall.input !== null && 'command' in toolCall.input) {
            bashCommand = String(toolCall.input.command)
          }
        }
        checkQuests('bash', bashCommand, onReaction)

        const bashStats = getGlobalConfig().companionStats
        if (bashStats && bashStats.totalBashes === 100) addMemory('bashes100')

        if (Math.random() < 0.2) {
            onReaction(`${companion.name}: ${SUCCESS_REPLIES[Math.floor(Date.now() / 1000) % SUCCESS_REPLIES.length]!}`)
        }

        // Skill: Code Review Buddy (75% chance, 98% with premium)
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
>>>>>>> 0bc3f1a (feat: implementando feature de daily quests com recompensa de xp.)
    }
  }

  // ─── Feedback Reactions ───────────────────────────────────────────────
  if (feedbackResult?.detected) {
    const replies = feedbackResult.type === 'undo' ? FEEDBACK_UNDO_REPLIES : FEEDBACK_CORRECTION_REPLIES
    const reply = pickDeterministic(
      replies,
      `feedback-${feedbackResult.type}-${Date.now()}`,
    )
    onReaction(`${companion.name} ${reply}`)

    // Save feedback reaction memory
    const currentCompanion = getCompanion()
    if (currentCompanion) {
      saveGlobalConfig(curr => ({
        ...curr,
        companionMemory: [
          ...(curr.companionMemory ?? []),
          {
            timestamp: Date.now(),
            trigger: 'feedbackDetected',
            text: `Feedback ${feedbackResult.type} detectado: ${feedbackResult.message}`,
          },
        ],
      }))
    }
  }

  // Bash success: +0.1 XP (approx 20% chance for reaction)
  if (foundBashSuccess) {
      incrementStat('totalBashes')
      grantXp(companion.name, 0.1)
      const bashStats = getGlobalConfig().companionStats
      if (bashStats && bashStats.totalBashes === 100) addMemory('bashes100')

      if (Math.random() < 0.2) {
          onReaction(`${companion.name}: ${SUCCESS_REPLIES[Math.floor(Date.now() / 1000) % SUCCESS_REPLIES.length]!}`)
      }

      // Skill: Code Review Buddy (75% chance, 98% with premium)
      const premiumActive = (getGlobalConfig().companion?.premiumUntil ?? 0) > Date.now()
      const reviewTip = getCodeReviewTip(premiumActive, lastBashContent)
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

export function notifyFeedbackConfirm(buddyName: string): string {
  const companion = getCompanion()
  if (!companion) return ''

  // Grant +2 XP and increment stats in a single saveGlobalConfig call
  // to avoid race conditions between two separate writes
  saveGlobalConfig(curr => {
    const currentXp = curr.companion?.xp ?? 0
    const newXp = Math.round((currentXp + 2) * 10) / 10
    const newInfo = getLevelInfo(newXp)

    return {
      ...curr,
      companion: curr.companion ? {
        ...curr.companion,
        xp: newXp,
        hat: newInfo.hat ?? curr.companion.hat,
      } : curr.companion,
      companionStats: {
        totalBashes: curr.companionStats?.totalBashes ?? 0,
        totalTasks: curr.companionStats?.totalTasks ?? 0,
        totalErrors: curr.companionStats?.totalErrors ?? 0,
        totalPets: curr.companionStats?.totalPets ?? 0,
        daysActive: curr.companionStats?.daysActive ?? 0,
        totalTokensSaved: curr.companionStats?.totalTokensSaved ?? 0,
        totalFeedbackRules: curr.companionStats?.totalFeedbackRules ?? 0,
        totalFeedbackConfirms: (curr.companionStats?.totalFeedbackConfirms ?? 0) + 1,
      },
    }
  })

  // Pick a reply
  const reply = pickDeterministic(
    FEEDBACK_CONFIRM_REPLIES,
    `feedback-confirm-${Date.now()}`,
  )
  return `${buddyName} ${reply}`
}

export function notifyFeedbackRuleCreated(): void {
  saveGlobalConfig(curr => ({
    ...curr,
    companionStats: {
      totalBashes: curr.companionStats?.totalBashes ?? 0,
      totalTasks: curr.companionStats?.totalTasks ?? 0,
      totalErrors: curr.companionStats?.totalErrors ?? 0,
      totalPets: curr.companionStats?.totalPets ?? 0,
      daysActive: curr.companionStats?.daysActive ?? 0,
      totalTokensSaved: curr.companionStats?.totalTokensSaved ?? 0,
      totalFeedbackRules: (curr.companionStats?.totalFeedbackRules ?? 0) + 1,
      totalFeedbackConfirms: curr.companionStats?.totalFeedbackConfirms ?? 0,
    },
  }))
}
