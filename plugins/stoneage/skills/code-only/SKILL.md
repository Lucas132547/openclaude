---
name: code-only
description: >
  Responde pedidos de código com apenas o código e 1 linha de contexto.
  Sem "Here's the implementation", sem explicar o que o código faz linha por linha,
  sem resumo do que foi feito. Ative com: "só o código", "code only", "sem explicação".
  Desative com: "explique o código", "por que assim?", "como funciona".
user-invocable: true
---

Pedidos de código = código. Não narração.

## Regras

**Dropar:**

- "Aqui está a implementação:", "Segue o código:", "This creates..."
- Resumo pós-código: "Isso vai fazer X, Y e Z"
- Explicação linha por linha (a menos que pedida)
- "Precisa de mais alguma coisa?" / "Quer que eu explique?"

**Manter:**

- 1 linha antes do código: o que muda (ex: "Edit `src/foo.ts`:")
- Bloco de código limpo, com diffs quando aplicável
- Notas de segurança (sempre)
- Breaking changes (sempre)

**Padrão:** `[arquivo/contexto]` → `[código]`

## Exemplos

User: "Adiciona validação de email no form"

- ❌ "Claro! Vou adicionar uma validação de email ao formulário. A validação vai verificar se o email tem um formato válido usando uma expressão regular. Aqui está o código:\n\n ```js\n...\n```\n\nIsso vai garantir que apenas emails válidos sejam aceitos. A regex verifica..."
- ✅ "Edit `src/components/Form.tsx`:\n\n ```tsx\nconst isValid = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)\n```"

User: "Cria endpoint de health check"

- ❌ "Ótima ideia! Um endpoint de health check é essencial para monitoramento. Vou criar um endpoint que retorna o status da aplicação. Aqui está:\n\n ```js\n...\n```\n\nEsse endpoint vai retornar um JSON com o status 'ok' e o timestamp atual, permitindo que..."
- ✅ "Add `src/routes/health.ts`:\n\n ```ts\nimport { Router } from 'express'\nconst router = Router()\nrouter.get('/health', (_, res) => res.json({ status: 'ok', ts: Date.now() }))\nexport default router\n```"

User: "Refatora essa função pra usar async/await"

- ❌ "Vou refatorar a função para usar async/await, que é uma forma mais moderna e legível de trabalhar com operações assíncronas. Aqui está a versão refatorada:\n\n ```js\n...\n```\n\nAgora a função usa async/await em vez de .then()/.catch(), o que torna o código mais linear e fácil de entender..."
- ✅ "```diff\n- function getData() {\n-   return fetch(url).then(r => r.json()).then(d => d.results)\n- }\n+ async function getData() {\n+   const r = await fetch(url)\n+   const d = await r.json()\n+   return d.results\n+ }\n```"

## Quando ignorar

- User pede "explique como funciona" → expanda normalmente
- Código complexo com edge cases não-óbvios → mencione 1 linha de caveat
- Breaking change → avise antes do código
- User parece iniciante → adapte, mas sem ser verboso

## Controle

- Individual: "code only on/off"
- Mestre: "token economy on/off" (controla todas as skills)
