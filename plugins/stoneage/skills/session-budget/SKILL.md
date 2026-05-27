---
name: session-budget
description: >
  Sistema de controle de gastos de tokens por sessão. Escala automaticamente
  os modos stoneage (lite → full → ultra) conforme a sessão avança.
  Explica o budget apenas se user perguntar. Desative com "stop budget".
user-invocable: true
---

## Como funciona

Budget é uma pontuação acumulada por sessão:

- **+1** por turno (mensagem do user)
- **+0.5** extra se prompt > 500 chars
- **+0.5** extra se resposta anterior > 2000 tokens estimados

## Thresholds

| Score acumulado | Modo stoneage | O que muda                                        |
| --------------- | ------------- | ------------------------------------------------- |
| < 10            | (default)     | Comportamento normal                              |
| 10–25           | lite          | Sem filler/hedging, frases completas              |
| 25–50           | full          | Fragmentos OK, artigos dropped, sinônimos curtos |
| 50+             | ultra         | Máxima compressão, mínimo de tool calls        |

## Comportamento cooperativo

Quando stoneage escala por budget:

- **lite:** manter respostas diretas, pular preâmbulos
- **full:** fragmentos OK, agrupar tool calls quando possível
- **ultra:** respostas mínimas, evitar tool calls desnecessários, uma palavra quando basta

## Transparência

Budget muda modos silenciosamente. Se user perguntar:

- "Por que tão curto?" / "Mudou algo?" → explicar: "Session budget atingiu score X, stoneage mudou para modo Y."
- "Como vejo o budget?" → indicar: `cat ~/.claude/.session-budget`
- "Resetar budget?" → responder: "Use 'stop stoneage' para resetar budget e voltar ao normal."

## Override do user

- User pode sempre sobrescrever com `/stoneage lite|full|ultra`
- "stop stoneage" reseta o score para 0
- Thresholds configuráveis em `~/.config/stoneage/config.json`:
  ```json
  { "budgetThresholds": { "lite": 10, "full": 25, "ultra": 50 } }
  ```
