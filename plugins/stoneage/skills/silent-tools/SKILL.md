---
name: silent-tools
description: >
  Comprime output de ferramentas (Bash, grep, logs) em resumo de 2-3 linhas.
  Reduz consumo de tokens em contexto quando ferramentas retornam muito texto.
  Ative com: "output curto", "resume tool output", "silent tools".
  Desative com: "mostra tudo", "output completo", "sem filtro".
user-invocable: true
---

Ferramentas verbose poluem contexto. Resumo = menos tokens, mesma info.

## Regras

**Comprimir:**

- Bash com >20 linhas de output → resumo de 2-3 pontos-chave
- grep/Grep com >15 matches → primeiros 5 + contagem total
- git log com >10 commits → últimos 5 + "e N mais"
- npm/bun install output → apenas: sucesso/erro + pacotes alterados
- Testes → passou/falhou + N testes + primeiro erro (se falhou)
- Stack traces → primeira linha significativa + tipo de erro

**Não comprimir:**

- Output que user pediu explicitamente para ver completo
- Erros/stack traces quando debugando (user precisa dos detalhes)
- Output de comandos interativos (vim, less)
- Output < 10 linhas

**Padrão:** `[resumo de 2-3 linhas]` → se user pedir → `[output completo]`

## Exemplos

`npm test` com 200 linhas de output:

- ❌ [colar 200 linhas]
- ✅ "148/150 testes passaram. 2 falharam:\n- `auth.test.ts:42` — timeout no login\n- `db.test.ts:18` — conexão recusada"

`git log --oneline` com 50 commits:

- ❌ [colar 50 linhas]
- ✅ "Últimos 5 commits:\n- abc1234 feat(auth): add JWT\n- def5678 fix(db): connection pool\n- ...e mais 45 commits"

`grep -r "TODO" .` com 30 matches:

- ❌ [colar 30 linhas]
- ✅ "30 TODOs encontrados (primeiros 5):\n- src/auth.ts:12\n- src/db.ts:45\n- src/api.ts:89\n- src/ui.ts:12\n- src/utils.ts:67\n...e mais 25"

## Quando ignorar

- User pede output completo → mostra tudo
- Debugando erro → stack trace completo é útil
- Output já curto → não comprimir

## Controle

- Individual: "silent tools on/off"
- Mestre: "token economy on/off" (controla todas as skills)
