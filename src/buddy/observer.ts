import type { Message } from '../types/message.js'
import { saveGlobalConfig, getGlobalConfig } from '../utils/config.js'
import { getUserMessageText } from '../utils/messages.js'
import { getCompanion } from './companion.js'
import { getLevelInfo } from './progression.js'

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
  'Oops, isso não parece bom.',
  'Hmm... detectei um erro no terminal.',
  'Quer uma ajuda com esse bug?',
  'Algo quebrou! Códigos de saída vermelhos...',
  'Eita, essa doeu até em mim.',
  'Não se preocupe, todo mundo erra.',
  'Falha na execução. Vamos debugar?',
  'Opa, acho que precisamos de um fix rápido.',
  'Deu ruim no comando.',
  'Olha pelo lado bom: agora você tem um puzzle para resolver!',
  'Um erro selvagem apareceu!',
  'Houston, temos um problema.'
] as const

const SUCCESS_REPLIES = [
  'Muito bem!',
  'Isso aí! Tudo verde.',
  'Adoro quando um plano dá certo.',
  'Comando executado com sucesso.',
  'Brilhante!',
  'Mandou bem demais!',
  'Zero erros, 100% de estilo.',
  'O código compilou de primeira? Que bruxaria é essa?',
  'Sucesso! Vamos para a próxima.',
  'Estou orgulhoso do seu progresso.',
  'Você está on fire hoje!',
  'Tudo rodando perfeitamente.'
] as const

const TASK_COMPLETED_REPLIES = [
  'Mais uma tarefa para a conta!',
  'Trabalho incrível! Tarefa concluída.',
  'Check! Isso merece uma comemoração.',
  'Menos uma no backlog.',
  'Tarefa finalizada com sucesso. Você é uma máquina!',
  'Risca essa da lista!',
  'Progresso é progresso. Muito bom!',
  'Missão cumprida.',
  'Uma etapa a menos para a glória.',
  'Concluído! O que vem a seguir?'
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
             // XP Logic
             const config = getGlobalConfig()
             const currentXp = config.companion?.xp ?? 0
             const newXp = currentXp + 1

             const oldInfo = getLevelInfo(currentXp)
             const newInfo = getLevelInfo(newXp)

             saveGlobalConfig(curr => {
               if (!curr.companion) return curr
               return {
                 ...curr,
                 companion: {
                   ...curr.companion,
                   xp: newXp,
                   hat: newInfo.hat ?? curr.companion.hat
                 }
               }
             })

             if (oldInfo.level !== newInfo.level) {
               onReaction(`${companion.name}: Uau! Subi para o Nível ${newInfo.level} e ganhei um chapéu novo!`)
             } else {
               onReaction(`${companion.name}: ${pickDeterministic(TASK_COMPLETED_REPLIES, Date.now().toString())}`)
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
       onReaction(`${companion.name}: ${pickDeterministic(ERROR_REPLIES, Date.now().toString())}`)
       return
    }

    // Occasional success reaction (approx 20% chance on successful Bash/tool execution)
    if (lastMessage.name === 'Bash' && !isError && !isBashFailure) {
        if (Math.random() < 0.20) {
            onReaction(`${companion.name}: ${pickDeterministic(SUCCESS_REPLIES, Date.now().toString())}`)
        }
    }
  }
}
