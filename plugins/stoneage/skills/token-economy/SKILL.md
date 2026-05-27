---
name: token-economy
description: >
  Skill mestra de economia de tokens. Controla todas as skills de redução de tokens.
  Ative/desative todas de uma vez ou individualmente. Use sempre que quiser controlar
  o consumo de tokens da sessão. Ative com: "token economy on/off", "liga/desliga token economy",
  ou controle individual como "answer first on/off", "silent tools on/off", etc.
user-invocable: true
---

Sistema de controle de gastos de tokens. Gerencia 8 skills de economia.

## Skills controladas

| Skill            | Default | O que faz                              |
| ---------------- | ------- | -------------------------------------- |
| `answer-first` | ON      | Respostas diretas, sem preâmbulo      |
| `code-only`    | OFF     | Código puro, sem narração           |
| `silent-tools` | OFF     | Comprime output verbose de ferramentas |
| `task-batch`   | ON      | Agrupa tool calls de tasks             |
| `context-trim` | OFF     | Resumos de tool results grandes        |
| `smart-diff`   | OFF     | Lê/edita só trechos de arquivos      |
| `memory-prune` | OFF     | Limpa MEMORY.md stale                  |

## Controle mestre

```
token economy on     → ativa todas as skills
token economy off    → desativa todas (mantém estado individual)
liga token economy   → mesmo que on
desliga token economy → mesmo que off
```

## Controle individual

```
answer first on / liga answer first
answer first off / desliga answer first
silent tools on / liga silent tools
silent tools off / desliga silent tools
code only on / liga code only
code only off / desliga code only
task batch on / liga task batch
task batch off / desliga task batch
context trim on / liga context trim
context trim off / desliga context trim
smart diff on / liga smart diff
smart diff off / desliga smart diff
memory prune on / liga memory prune
memory prune off / desliga memory prune
```

## Estado

Arquivo `~/.claude/.token-economy` mantém estado persistente:

```json
{
  "master": true,
  "skills": {
    "answer-first": true,
    "code-only": false,
    ...
  }
}
```

## Quando usar

- **Sessão rápida** (< 10 turnos): `token economy off` — overhead desnecessário
- **Sessão longa**: `token economy on` — ativa tudo, deixa session-budget escalar
- **Debug**: desativa `silent-tools` e `context-trim` — precisa ver output completo
- **Feature dev**: ativa `code-only` e `smart-diff` — foco em código

## Ver estado atual

```
cat ~/.claude/.token-economy
```
