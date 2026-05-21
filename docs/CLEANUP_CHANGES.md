# Cleanup Changes

## Utilidade

Conjunto de melhorias de infraestrutura e limpeza de código que não alteram funcionalidade mas melhoram a manutenibilidade e consistência do projeto.

## Mudanças

### 1. Remoção do package-lock.json

**O quê:** O arquivo `package-lock.json` foi removido. O projeto usa Bun, então apenas `bun.lock` deve existir.

**Por quê:** Ter ambos os lock files causa confusão sobre qual package manager é o canônico. O `bun.lock` é o oficial.

**Impacto:** Nenhum. O `bun install` continua funcionando normalmente.

### 2. Refatoração de compact.ts

**O quê:** O `src/services/compact/compact.ts` foi refatorado para usar `isMemoryFilePath()` do módulo `claudemd.ts` em vez de verificação manual de caminhos.

**Por quê:** Consistência — o helper já existia e era usado em outros lugares. O código duplicado era propenso a divergir.

**Arquivo:** `src/services/compact/compact.ts`

### 3. CompanionSprite.tsx — Padronização

**O quê:** Ajustes no componente de sprite do companion para consistência com o sistema de linguagem.

**Arquivo:** `src/buddy/CompanionSprite.tsx`

### 4. REPL.tsx — Remoção de código morto

**O quê:** Remoção de código não utilizado no componente REPL.

**Arquivo:** `src/screens/REPL.tsx`

## Quando utilizar

Essas mudanças são transparentes — não requerem ação do usuário. Estão documentadas para referência futura caso alguém questione por que o `package-lock.json` foi removido ou por que o `compact.ts` mudou.
