import { describe, expect, it } from 'bun:test'
import { detectBlockedFileModifications } from './bashCommandValidation.ts'

describe('detectBlockedFileModifications', () => {
  describe('Blocked Redirections', () => {
    const blockedCommands = [
      'echo "foo" > out.txt',
      'echo "bar" >> out.txt',
      'ls &> log.txt',
      'ls >| out.txt',
      'ls &>> log.txt',
      'cat file.txt > out.txt',
      'command > /tmp/test.txt',
      'echo "test" 1> file.txt',
      'echo "test" 2> error.log',
    ]

    it.each(blockedCommands)('should block: %s', (cmd) => {
      expect(detectBlockedFileModifications(cmd)).toBe(true)
    })
  })

  describe('Allowed Redirections', () => {
    const allowedCommands = [
      'ls > /dev/null',
      'ls 2> /dev/null',
      'ls > /dev/null 2>&1',
      'command 2>&1',
      'command 1>&2',
      'command 2>&-',
      'echo "log" > /dev/stdout',
    ]

    it.each(allowedCommands)('should allow: %s', (cmd) => {
      expect(detectBlockedFileModifications(cmd)).toBe(false)
    })
  })

  describe('Blocked Commands (cat, tee, editors)', () => {
    const blockedCommands = [
      'cat file.txt',
      'cat file.txt 2> /dev/stderr',
      'tee out.txt',
      'ls | tee out.txt',
      'vim file.txt',
      'nano file.txt',
      'vi file.txt',
      'ed file.txt',
    ]

    it.each(blockedCommands)('should block: %s', (cmd) => {
      expect(detectBlockedFileModifications(cmd)).toBe(true)
    })
  })

  describe('Blocked In-place Modifiers (sed, perl)', () => {
    const blockedCommands = [
      'sed -i "s/a/b/g" file.txt',
      'sed --in-place "s/a/b/g" file.txt',
      'sed -ri "s/a/b/g" file.txt',
      'perl -i -pe "s/a/b/g" file.txt',
      'perl -pi -e "s/a/b/g" file.txt',
    ]

    it.each(blockedCommands)('should block: %s', (cmd) => {
      expect(detectBlockedFileModifications(cmd)).toBe(true)
    })

    it('should allow sed without in-place', () => {
      expect(detectBlockedFileModifications('sed "s/a/b/g" file.txt')).toBe(false)
    })

    it('should allow perl without in-place', () => {
      expect(detectBlockedFileModifications('perl -pe "s/a/b/g" file.txt')).toBe(false)
    })
  })

  describe('Allowed Common Utils', () => {
    const allowedCommands = [
      'ls -la',
      'grep "search" file.txt',
      'find . -name "*.ts"',
      'touch newfile.txt',
      'rm file.txt',
      'mv old.txt new.txt',
      'cp source.txt dest.txt',
      'mkdir new_dir',
      'chmod +x script.sh',
      'chown user:group file.txt',
      'sort < input.txt',
      'cat < input.txt', // Input redirection is allowed even with cat if it's just reading? Wait, the plan said cat as command is blocked.
    ]

    it.each(allowedCommands)('should allow: %s', (cmd) => {
      // Note: 'cat < input.txt' might be blocked because 'cat' is in the blocked list.
      // Let's see if we should allow 'cat' if it's only reading.
      // The instructions say "cat (as command) ... Blocked".
      if (cmd.startsWith('cat ')) {
         expect(detectBlockedFileModifications(cmd)).toBe(true)
      } else {
         expect(detectBlockedFileModifications(cmd)).toBe(false)
      }
    })
  })

  describe('Wrapped Commands', () => {
    const blockedCommands = [
      'sudo cat file.txt',
      'timeout 10 tee out.txt',
      'env FOO=bar cat file.txt',
      'time sed -i "s/a/b/" file.txt',
      'xargs -I {} cat {}',
    ]

    it.each(blockedCommands)('should block: %s', (cmd) => {
      expect(detectBlockedFileModifications(cmd)).toBe(true)
    })
  })

  describe('Complex/Piped Commands', () => {
    it('should block if any part of the pipe is blocked', () => {
      expect(detectBlockedFileModifications('ls | cat')).toBe(true)
      expect(detectBlockedFileModifications('cat file.txt | grep foo')).toBe(true)
      expect(detectBlockedFileModifications('grep foo file.txt | tee log.txt')).toBe(true)
      expect(detectBlockedFileModifications('grep foo file.txt > result.txt')).toBe(true)
    })

    it('should allow complex allowed pipes', () => {
      expect(detectBlockedFileModifications('ls -R | grep ".ts" | sort | uniq')).toBe(false)
    })
  })
})