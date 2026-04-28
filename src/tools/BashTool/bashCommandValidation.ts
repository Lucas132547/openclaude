import { tryParseShellCommand, ParseEntry } from '../../utils/bash/shellQuote.js'
import { queryWithModel } from '../../services/api/claude.js'
import { getSmallFastModel } from '../../utils/model/model.js'
import { asSystemPrompt } from '../../utils/systemPromptType.js'

const BLOCKED_EDITORS = new Set(['vi', 'vim', 'nano', 'ed'])
const IN_PLACE_MODIFIERS = new Set(['sed', 'perl'])
const WRAPPER_COMMANDS = new Set([
  'env', 'time', 'stdbuf', 'nohup', 'timeout', 'watch', 'xargs', 'sudo',
  'exec', 'eval', 'command', 'builtin', 'su', 'doas'
])

/**
 * Checks if a bash command attempts to edit files or use redirection,
 * which should be blocked to encourage usage of FileReadTool/FileWriteTool/FileEditTool.
 */
export function detectBlockedFileModifications(command: string): boolean {
  let partsWithOperators: ParseEntry[]
  try {
    const parseResult = tryParseShellCommand(command)
    if (!parseResult.success) return false
    partsWithOperators = parseResult.tokens
  } catch {
    return false
  }
  if (partsWithOperators.length === 0) return false

  let skipNextAsRedirectTarget = false
  let expectingCommand = true
  let prevToken: string | null = null

  for (let i = 0; i < partsWithOperators.length; i++) {
    const part = partsWithOperators[i]!

    if (skipNextAsRedirectTarget) {
      skipNextAsRedirectTarget = false
      if (typeof part === 'string') {
        prevToken = part
      }
      continue
    }

    if (typeof part !== 'string') {
      const op = (part as any).op || part
      if (op === '>' || op === '>>' || op === '>&' || op === '&>' || op === '&>>' || op === '>|') {
        // If this is >& and the next part is a number or -, we don't need to block it
        if (op === '>&' && i + 1 < partsWithOperators.length) {
          const nextPart = partsWithOperators[i + 1]!
          if (typeof nextPart === 'string' && (/^\d+$/.test(nextPart) || nextPart === '-')) {
            // It's something like 2>&1 or 2>&-, skip the next part which is just a file descriptor
            skipNextAsRedirectTarget = true
            continue
          }
        }

        // Handle >| which is parsed as > then |
        if (op === '>' && i + 1 < partsWithOperators.length) {
          const nextPart = partsWithOperators[i + 1]!
          if (typeof nextPart !== 'string' && (nextPart as any).op === '|') {
             // It's >|
             return true
          }
        }

        // It's a redirection operator
        if (i + 1 < partsWithOperators.length) {
          const nextPart = partsWithOperators[i + 1]!
          if (
            typeof nextPart === 'string' &&
            nextPart.startsWith('/dev/')
          ) {
            skipNextAsRedirectTarget = true
            continue // Allowed
          }
        }

        return true // Redirection to non-/dev/ file
      } else if (op === '<') {
        // Only skip the next part if it's a string, otherwise it might be another operator
        if (i + 1 < partsWithOperators.length && typeof partsWithOperators[i + 1] === 'string') {
          skipNextAsRedirectTarget = true
        }
      }

      // Control operators start a new command. Redirects just attach to current command.
      if (op === '|' || op === '||' || op === '&&' || op === ';' || op === '&' || op === '|&' || op === '(') {
        expectingCommand = true
      }
      prevToken = null
      continue
    }

    // Skip environment variable assignments
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(part)) {
      prevToken = part
      continue
    }

    if (!expectingCommand) {
      prevToken = part
      continue
    }

    // Skip tokens that are clearly not the command name if we just saw a wrapper
    if (prevToken && (WRAPPER_COMMANDS.has(prevToken) || prevToken.startsWith('-') || /^\d+$/.test(prevToken) || prevToken === '{}')) {
        if (part.startsWith('-') || /^\d+$/.test(part) || part === '{}') {
            prevToken = part
            continue
        }
    }

    const commandName = part.split('/').pop() || part

    if (WRAPPER_COMMANDS.has(commandName)) {
      // Find the actual command after wrapper
      prevToken = part
      // Stay in expectingCommand = true to find the next command name
      continue
    }

    // Block cat and tee always
    if (commandName === 'cat' || commandName === 'tee') {
      return true
    }

    // Check for directly blocked commands
    if (BLOCKED_EDITORS.has(commandName)) return true

    // Check sed and perl for in-place edits
    if (IN_PLACE_MODIFIERS.has(commandName)) {
      // Find the first part after the command
      for (let j = i + 1; j < partsWithOperators.length; j++) {
        const flagPart = partsWithOperators[j]!
        if (typeof flagPart === 'string') {
          if (flagPart === '--') break // End of flags

          if (flagPart.startsWith('--in-place')) return true
          // Short flag cluster containing 'i'
          if (/^-[a-zA-Z0-9]*i/.test(flagPart)) return true
        } else {
          break // end of simple arguments
        }
      }
    }

    expectingCommand = false
    prevToken = part
  }

  return false
}

/**
 * Uses a fast LLM (e.g. Haiku or Flash Lite) to analyze if a command
 * attempts to modify files locally, acting as a smart fallback.
 */
export async function isBlockedBySmartValidation(
  command: string,
  abortSignal: AbortSignal,
  options: any,
): Promise<boolean> {
  // Only trigger on complex commands (heuristic)
  if (command.length < 100 && !command.includes('|') && !command.includes('EOF')) {
    return false
  }

  const systemPrompt = "Analyze this bash command. Does it attempt to modify, overwrite, or write new content to any file on the local filesystem (excluding /dev/null, temporary stdout manipulation, or purely read operations)? Output ONLY 'yes' or 'no'."

  try {
    const response = await queryWithModel({
      systemPrompt: asSystemPrompt([systemPrompt]),
      userPrompt: `<command>${command}</command>`,
      signal: abortSignal,
      options: {
        ...options,
        model: getSmallFastModel(),
        maxOutputTokensOverride: 10,
        temperature: 0,
      },
    })

    const content = response.content
    const text = typeof content === 'string'
      ? content
      : content.find((c: any) => c.type === 'text')?.text || ''

    return text.trim().toLowerCase() === 'yes' || text.trim().toLowerCase().startsWith('yes')
  } catch (error) {
    // If the LLM fails, default to passing to not block the user unexpectedly
    return false
  }
}
