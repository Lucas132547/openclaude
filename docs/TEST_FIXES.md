# Test Fixes

## Utilidade

Correção de 3 testes que estavam falhando, resultando em uma suite de testes 100% passando (2823 testes, 0 falhas). Os testes quebrados eram causados por mudanças no código fonte que não foram refletidas nos testes, ou por uso incorreto de APIs do runtime.

## Correções

### 1. geminiOAuth.ts — AbortSignal.timeout() memory leak

**Problema:** O código usava `AbortSignal.timeout()` diretamente, que causa memory leak no Bun runtime.

**Antes:**

```typescript
const signal = AbortSignal.any([options.signal, AbortSignal.timeout(15_000)]);
```

**Depois:**

```typescript
const combined = createCombinedAbortSignal(options.signal, 15_000);
try {
  // ... código
} finally {
  combined.cleanup();
}
```

**Arquivo:** `src/services/api/geminiOAuth.ts`

### 2. providerValidation.test.ts — Assertion desatualizada

**Problema:** O teste esperava mensagens de erro com recovery guidance (`'set CLAUDE_CODE_USE_OPENAI=0...'`), mas a validação agora usa mensagens baseadas em descriptors que retornam apenas a primeira linha.

**Correção:** Removidas as duas assertions obsoletas, mantendo o check da mensagem principal.

**Arquivo:** `src/utils/providerValidation.test.ts`

### 3. openaiShim.test.ts — Expectation de whitespace

**Problema:** O teste esperava `" pwd"` (com espaço inicial) no output normalizado, mas `normalizeToolArguments` agora aplica `.trim()` para limpar output markdown do LLM.

**Correção:** Atualizada expectation de `'{"command":" pwd"}'` para `'{"command":"pwd"}'`.

**Arquivo:** `src/services/api/openaiShim.test.ts`

## Quando utilizar

- **Antes de commitar** — rode `bun test` para garantir que todos passam
- **Ao modificar código de providers** — verifique se os testes de validação ainda passam
- **Ao modificar tool arguments** — verifique se o openaiShim test ainda passa

## Resultado

```
 2823 pass
 0 fail
 6130 expect() calls
```
