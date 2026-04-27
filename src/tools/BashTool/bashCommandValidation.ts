import { splitCommandWithOperators } from '../../utils/bash/commands.js'

/**
 * Checks if a bash command attempts to edit files or use redirection,
 * which should be blocked to encourage usage of FileReadTool/FileWriteTool/FileEditTool.
 */
export function detectBlockedFileModifications(command: string): boolean {
  let partsWithOperators: string[]
  try {
    partsWithOperators = splitCommandWithOperators(command)
  } catch {
    return false
  }
  if (partsWithOperators.length === 0) return false

  let skipNextAsRedirectTarget = false
  for (let i = 0; i < partsWithOperators.length; i++) {
    const part = partsWithOperators[i]!

    if (skipNextAsRedirectTarget) {
      skipNextAsRedirectTarget = false
      continue
    }

    // Block file redirection (except to /dev/null or /dev/stderr)
    if (part === '>' || part === '>>' || part === '>&') {
      const nextPart = partsWithOperators[i + 1]?.trim()
      if (nextPart && !nextPart.startsWith('/dev/')) {
        return true
      }
      skipNextAsRedirectTarget = true
      continue
    }

    if (part === '||' || part === '&&' || part === '|' || part === ';') {
      continue
    }

    const tokens = part.trim().split(/\s+/)
    const baseCommand = tokens[0]

    // Block cat
    if (baseCommand === 'cat') {
      return true
    }

    // Block interactive editors
    if (['vi', 'vim', 'nano', 'ed'].includes(baseCommand as string)) {
      return true
    }

    // Block in-place modifiers (like sed -i, perl -i)
    if (['sed', 'perl'].includes(baseCommand as string)) {
      if (tokens.some(t => t === '-i' || t.startsWith('--in-place'))) {
        return true
      }
    }
  }

  return false
}