---
name: stoneage-stats
description: >
  Exibe estatísticas de economia de tokens da sessão stoneage.
  Mostra tokens salvos estimados, custo USD economizado, e histórico.
  Use: /stoneage-stats ou "mostrar stats stoneage"
user-invocable: true
---

# Stoneage Stats

## Propósito

Mostrar quanto o stoneage economizou nesta sessão e no total.

## Processo

1. Ler dados da sessão atual (tokens de output usados)
2. Calcular economia estimada (baseline 65% de redução)
3. Calcular USD economizado baseado no modelo atual
4. Exibir resumo formatado

## Formato de Saída

```
🪨 Stoneage Stats
──────────────────────
Turnos:           X
Output tokens:    X
Economia est.:    X (~65%)
USD economizado:  ~$X.XX
──────────────────────
```

## Cálculo

- `tokens_sem_stoneage = output_tokens / (1 - 0.65)`
- `tokens_economizados = tokens_sem_stoneage - output_tokens`
- `usd_economizado = (tokens_economizados / 1_000_000) * preco_modelo`

## Limites

Apenas exibe dados. Não modifica nada. Estimativa baseada em benchmarks médios.
