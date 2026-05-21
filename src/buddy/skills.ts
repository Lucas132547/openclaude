import { getGlobalConfig } from '../utils/config.js'
import { getLevelInfo } from './progression.js'

// Dicas contextuais em erros (Level 2+)
const ERROR_TIPS = [
  'Tenta verificar o log de erro completo antes de tentar de novo.',
  'Já conferiu se o arquivo existe e o caminho está correto?',
  'Talvez um `git diff` ajude a ver o que mudou.',
  'As vezes rodar o comando sem pipe ajuda a isolar o erro.',
  'Verifica se tem algum arquivo de config faltando.',
  'Tenta rodar com mais verbose flags pra ver mais detalhes.',
]

// Sugestões de próximo passo (Level 6)
const NEXT_STEP_SUGGESTIONS = [
  'Que tal rodar os testes pra garantir que tudo funciona?',
  'Talvez seja hora de commitar essas mudanças.',
  'Já pensou em revisar o diff antes de continuar?',
  'Pode ser bom atualizar a documentação se mudou algo.',
  'Que tal um `git status` pra ver o estado atual?',
]

export function getErrorTip(): string | null {
  const config = getGlobalConfig()
  const xp = config.companion?.xp ?? 0
  const levelInfo = getLevelInfo(xp)

  if (levelInfo.level < 2) return null
  if (Math.random() > 0.10) return null // 10% chance

  return ERROR_TIPS[Math.floor(Date.now() / 1000) % ERROR_TIPS.length]!
}

export function getNextStepSuggestion(): string | null {
  const config = getGlobalConfig()
  const xp = config.companion?.xp ?? 0
  const levelInfo = getLevelInfo(xp)

  if (levelInfo.level < 6) return null

  return NEXT_STEP_SUGGESTIONS[Math.floor(Date.now() / 1000) % NEXT_STEP_SUGGESTIONS.length]!
}

export function getSessionSummary(): string | null {
  const config = getGlobalConfig()
  const xp = config.companion?.xp ?? 0
  const levelInfo = getLevelInfo(xp)

  if (levelInfo.level < 4) return null

  const stats = config.companionStats
  if (!stats) return null

  return `📊 Resumo da sessão:\n` +
    `Comandos: ${stats.totalBashes} | Tasks: ${stats.totalTasks} | Erros: ${stats.totalErrors}\n` +
    `XP: ${xp} | Level: ${levelInfo.level} | Streak: ${config.companionStreakCount ?? 0} dias`
}
