---
name: context-trim
description: >
  Reduz consumo de contexto ignorando output de ferramentas grandes. Quando uma ferramenta
  (Bash, Grep, Read, etc.) retorna muito texto, extraia só os dados-chave. Não re-emita
  output completo nas respostas. Use "mostra tudo" para desativar.
user-invocable: true
---

Tool results grandes poluem contexto. Extraia dados, descarte ruído.

## Regras

**Ferramentas com output > 50 linhas:**

- Extrair apenas pontos-chave, erros, primeiros e últimos resultados
- Não re-emitir output completo na resposta
- Resumir em 3-5 bullet points

**Ferramentas com output > 200 linhas:**

- Extrair apenas o primeiro erro (se houver) e contagem de resultados
- Ignorar linhas intermediárias repetitivas
- Nunca mais de 5 linhas de output na resposta

**Exceções (nunca truncar):**

- Usuário pediu explicitamente para ver output completo
- Debugando erro e precisa de stack trace completo
- Output de comandos interativos

## Padrão de Resposta

Quando ferramenta retorna muito texto:

```
[Tool result: 200 linhas]
↓
Resumo: X erros encontrados, primeiro erro: [trecho]. Y testes passaram.
```

## Quando Expandir

Se usuário pedir "mostra tudo", "sem filtro", "output completo":

- Forneça o output completo
- Retorne ao modo context-trim na próxima mensagem

## Controle

- Individual: "context trim on/off"
- Mestre: "token economy on/off" (controla todas as skills)
