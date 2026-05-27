---
name: stoneage-commit
description: >
  Gerador de mensagens de commit ultra-compacto com estilo pré-histórico. Formato Conventional Commits.
  Assunto ≤50 chars, corpo apenas quando "por quê" não é óbvio.
  Use quando o usuário disser "commit", "mensagem de commit", "/commit", ou invocar /stoneage-commit.
user-invocable: true
---

Escreva mensagens de commit como inscrição rupestre: curta, exata, conta a história essencial.

## Regras

**Linha de assunto:**

- `<tipo>(<escopo>): <resumo imperativo>` — `<escopo>` opcional
- Tipos: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`, `build`, `ci`, `style`, `revert`
- Modo imperativo: "add", "fix", "remove" — não "adicionado", "adiciona", "adicionando"
- ≤50 chars quando possível, teto 72
- Sem ponto final
- Seguir convenção do projeto para capitalização após os dois-pontos

**Corpo (apenas se necessário):**

- Pular completamente quando o assunto é autoexplicativo
- Adicionar corpo apenas para: *por quê* não-óbvio, breaking changes, notas de migração, issues referenciadas
- Wrap em 72 chars
- Bullets `-` não ``
- Referenciar issues/PRs no final: `Closes #42`, `Refs #17`

**O que NUNCA vai na mensagem:**

- "Este commit faz X", "eu", "nós", "agora", "atualmente" — o diff diz o quê
- "Como solicitado por..." — usar trailer Co-authored-by
- "Gerado com Claude Code" ou qualquer atribuição de IA
- Emoji (a menos que a convenção do projeto exija)
- Repetir o nome do arquivo quando o escopo já diz

## Exemplos

Diff: novo endpoint para perfil de usuário com corpo explicando o por quê

- ❌ "feat: adicionar um novo endpoint para obter informações de perfil do usuário"
- ✅
  ```
  feat(api): add GET /users/:id/profile

  Cliente mobile precisa de dados de perfil sem o payload completo
  do usuário para reduzir bandwidth LTE em telas de cold-launch.

  Closes #128
  ```

## Limites

Gera apenas a mensagem. Não roda `git commit`, não faz stage, não faz amend. Saída como bloco de código pronto para colar.
