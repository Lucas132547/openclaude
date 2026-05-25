import { join } from 'path'
import {
  readFeedbackEvents,
  clearFeedbackLog,
  resetFeedbackLog,
  getFeedbackLogPath,
  FeedbackEvent,
} from '../../memdir/feedbackLog.js'
import { scanMemoryFiles } from '../../memdir/memoryScan.js'
import { getAutoMemPath } from '../../memdir/paths.js'
import { getFsImplementation } from '../../utils/fsOperations.js'
import { parseFrontmatter } from '../../utils/frontmatterParser.js'
import type { LocalCommandCall, LocalCommandResult } from '../../types/command.js'
import chalk from 'chalk'

function stringifyFrontmatter(frontmatter: Record<string, any>): string {
  const lines = ['---']
  for (const [key, value] of Object.entries(frontmatter)) {
    if (value !== undefined && value !== null) {
      lines.push(`${key}: ${value}`)
    }
  }
  lines.push('---')
  return lines.join('\n')
}

export const call: LocalCommandCall = async (args, context): Promise<LocalCommandResult> => {
  const fs = getFsImplementation()
  const trimmedArgs = args.trim()
  const subCommand = trimmedArgs.split(' ')[0] || ''
  const subArgs = trimmedArgs.slice(subCommand.length).trim()

  switch (subCommand) {
    case 'confirm': {
      const events = await readFeedbackEvents()
      const lastIndex = [...events].reverse().findIndex(e => !e.confirmed && (e.type === 'undo' || e.type === 'correction'))
      
      if (lastIndex === -1) {
        return {
          type: 'text',
          value: chalk.yellow('[Feedback System] Nenhum evento pendente para confirmação no log de sessões.'),
        }
      }

      // Convert back to positive index in original array
      const actualIndex = events.length - 1 - lastIndex
      events[actualIndex]!.confirmed = true

      // Save events log back
      const logPath = getFeedbackLogPath()
      const logContent = events.map(e => JSON.stringify(e)).join('\n') + '\n'
      try {
        await fs.unlink(logPath)
      } catch {}
      fs.appendFileSync(logPath, logContent, { encoding: 'utf8' })

      return {
        type: 'text',
        value: chalk.green('[Feedback System] Padrão de feedback confirmado e salvo com sucesso! O sintetizador dará prioridade extra a esta regra na próxima consolidação.'),
      }
    }

    case 'list': {
      const memories = await scanMemoryFiles(getAutoMemPath(), context.abortController.signal)
      const feedbackMemories = memories.filter(m => m.type === 'feedback')

      if (feedbackMemories.length === 0) {
        return {
          type: 'text',
          value: chalk.cyan('[Feedback System] Nenhuma memória de feedback encontrada para este projeto. Utilize o sintetizador para criá-las automaticamente ou confirme novos padrões.'),
        }
      }

      const rows = feedbackMemories.map(m => {
        const score = m.score !== undefined ? m.score : 'N/A'
        const scoreColor = typeof score === 'number' && score >= 80
          ? chalk.bold.green(score)
          : typeof score === 'number' && score < 20
            ? chalk.red(score)
            : chalk.cyan(score)
        const confirmations = m.confirmations !== undefined ? m.confirmations : 0
        const status = m.ignored ? chalk.gray('Ignorada') : (typeof score === 'number' && score >= 80 ? chalk.bold.green('Crítica') : chalk.green('Ativa'))
        return `| ${m.filename.padEnd(28)} | ${String(score).padEnd(5)} | ${String(confirmations).padEnd(13)} | ${status.padEnd(15)} | ${String(m.description || '').substring(0, 45).padEnd(45)} |`
      })

      const table = [
        `┌${'─'.repeat(30)}┬${'─'.repeat(7)}┬${'─'.repeat(15)}┬${'─'.repeat(17)}┬${'─'.repeat(47)}┐`,
        `| ${'Tema / Memória'.padEnd(28)} | ${'Score'.padEnd(5)} | ${'Confirmações'.padEnd(13)} | ${'Status'.padEnd(10)} | ${'Descrição'.padEnd(45)} |`,
        `├${'─'.repeat(30)}┼${'─'.repeat(7)}┼${'─'.repeat(15)}┼${'─'.repeat(17)}┼${'─'.repeat(47)}┤`,
        ...rows,
        `└${'─'.repeat(30)}┴${'─'.repeat(7)}┴${'─'.repeat(15)}┴${'─'.repeat(17)}┴${'─'.repeat(47)}┘`,
      ].join('\n')

      return {
        type: 'text',
        value: chalk.bold('Memórias de Feedback Aprendidas:\n\n') + table,
      }
    }

    case 'review': {
      const memories = await scanMemoryFiles(getAutoMemPath(), context.abortController.signal)
      const feedbackMemories = memories.filter(m => m.type === 'feedback')
      const staleMemories = feedbackMemories.filter(m => m.score !== undefined && m.score < 20)

      if (staleMemories.length === 0) {
        return {
          type: 'text',
          value: chalk.green('[Feedback System] Nenhuma memória de feedback obsoleta (score < 20) encontrada. Todas as regras estão com boa relevância!'),
        }
      }

      const list = staleMemories.map(m => `- ${m.filename} (Score: ${m.score})`).join('\n')
      return {
        type: 'text',
        value: chalk.yellow(`[Feedback System] Encontradas memórias obsoletas recomendadas para remoção/limpeza:\n\n${list}\n\nUse "/feedback reset" para limpar todas ou reescreva regras específicas.`),
      }
    }

    case 'clear': {
      await clearFeedbackLog(0)
      return {
        type: 'text',
        value: chalk.green('[Feedback System] Log de eventos de feedback brutos limpo com sucesso!'),
      }
    }

    case 'reset': {
      await resetFeedbackLog()
      const memories = await scanMemoryFiles(getAutoMemPath(), context.abortController.signal)
      const feedbackMemories = memories.filter(m => m.type === 'feedback')
      
      for (const m of feedbackMemories) {
        try {
          await fs.unlink(m.filePath)
        } catch {}
      }

      return {
        type: 'text',
        value: chalk.red('[Feedback System] Redefinição concluída. Todas as memórias e logs de feedback deste projeto foram removidos permanentemente!'),
      }
    }

    case 'ignore': {
      const theme = subArgs
      if (!theme) {
        return {
          type: 'text',
          value: chalk.yellow('[Feedback System] Por favor, informe o tema/arquivo a ser ignorado. Exemplo: "/feedback ignore feedback-auth-patterns"'),
        }
      }

      const memories = await scanMemoryFiles(getAutoMemPath(), context.abortController.signal)
      const target = memories.find(m => m.filename.toLowerCase() === theme.toLowerCase() || m.filename.toLowerCase() === `feedback-${theme.toLowerCase()}-patterns.md`)

      if (!target) {
        return {
          type: 'text',
          value: chalk.red(`[Feedback System] Memória de feedback "${theme}" não encontrada neste projeto.`),
        }
      }

      // Read file, parse frontmatter, inject ignored: true
      try {
        const fullContent = await fs.readFile(target.filePath, { encoding: 'utf8' })
        const { frontmatter, content } = parseFrontmatter(fullContent, target.filePath)
        frontmatter.ignored = true
        
        const newFrontmatterStr = stringifyFrontmatter(frontmatter)
        const finalContent = `${newFrontmatterStr}\n${content}`
        
        await fs.unlink(target.filePath)
        fs.appendFileSync(target.filePath, finalContent, { encoding: 'utf8' })
        
        return {
          type: 'text',
          value: chalk.green(`[Feedback System] O tema de feedback "${target.filename}" foi marcado como ignorado e não será mais carregado nas sessões.`),
        }
      } catch (error) {
        return {
          type: 'text',
          value: chalk.red(`[Feedback System] Erro ao ignorar o tema: ${error}`),
        }
      }
    }

    case 'synthesize': {
      // Lazy load the synthesizer
      const { runFeedbackSynthesis } = await import('../../memdir/feedbackSynthesizer.js')
      const result = await runFeedbackSynthesis(context)
      return {
        type: 'text',
        value: result,
      }
    }

    default: {
      const helpText = [
        chalk.bold('Feedback Learning System — Comandos Disponíveis:'),
        '',
        `  ${chalk.cyan('/feedback')}                      Exibe esta ajuda.`,
        `  ${chalk.cyan('/feedback confirm')}              Confirma o último padrão de correção/undo detectado.`,
        `  ${chalk.cyan('/feedback list')}                 Lista as memórias de feedback aprendidas com seus scores.`,
        `  ${chalk.cyan('/feedback review')}               Lista as memórias que ficaram fracas/obsoletas (score < 20).`,
        `  ${chalk.cyan('/feedback ignore <tema>')}        Marca um tema de feedback como ignorado para não ser carregado.`,
        `  ${chalk.cyan('/feedback synthesize')}           Executa a consolidação inteligente de logs brutos em memórias.`,
        `  ${chalk.cyan('/feedback clear')}                Limpa os logs de eventos brutos acumulados nesta sessão.`,
        `  ${chalk.cyan('/feedback reset')}                Remove permanentemente todas as memórias e logs de feedback.`,
      ].join('\n')

      return {
        type: 'text',
        value: helpText,
      }
    }
  }
}
