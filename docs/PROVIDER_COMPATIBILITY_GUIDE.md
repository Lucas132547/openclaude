# Provider Compatibility Matrix

## Utilidade

Documenta quais funcionalidades do OpenClaude funcionam com cada provider LLM. Antes dessa documentação, usuários precisavam descobrir por tentativa e erro quais features (tool use, streaming, vision, etc.) suportavam seu provider. Agora existe uma referência centralizada com tabelas de compatibilidade, dicas de configuração e limitações conhecidas.

## Como utilizar

### Consulta rápida

Abra `docs/PROVIDER_COMPATIBILITY.md` e procure:

1. **Tabela resumo** no topo — visão geral de vendors e gateways
2. **Seção detalhada** por provider — auth, modelos, limitações
3. **Deep-dives** por feature — prompt caching, reasoning, vision, web search

### Exemplo de uso

Quer saber se o Gemini suporta tool use?
→ Seção "Gemini" → Coluna "Tool Use" → ✅ Sim

Quer saber se o Ollama suporta prompt caching?
→ Seção "Ollama" → Nota: "No prompt caching support"

Quer comparar providers para uma use case?
→ Seção "Provider Selection Guide" → Recomendação por caso de uso

## Quando utilizar

- **Antes de escolher um provider** — verifique se suporta as features que você precisa
- **Ao configurar um novo provider** — consulte as dicas de auth e modelos
- **Ao encontrar comportamento inesperado** — pode ser uma limitação documentada do provider
- **Ao reportar bugs** — verifique se o comportamento é uma limitação conhecida

## Providers cobertos (27 total)

### Vendors (11)

Anthropic, OpenAI, Gemini, DeepSeek, xAI, MiniMax, Moonshot, Venice, Z.AI, Xiaomi MiMo, Bankr

### Gateways (16)

GitHub Copilot, AWS Bedrock, Google Vertex AI, Ollama, LM Studio, Groq, OpenRouter, Mistral, Azure OpenAI, Together AI, Hicap, DashScope CN/INTL, NVIDIA NIM, Kimi Code, Atomic Chat, Gitlawb Opengateway

## Descobertas surpreendentes

| Provider            | Achado                                                                       |
| ------------------- | ---------------------------------------------------------------------------- |
| MiniMax Vision-01   | Modelos de visão que **não suportam function calling** — inúteis para coding |
| Todos exceto OpenAI | Contagem de tokens é **estimativa**, não precisa                             |
| Web search          | Exclusivo de Anthropic/Bedrock/Vertex                                        |
| GitHub Copilot      | "Dupla personalidade" — Claude usa transporte nativo, GPT usa OpenAI shim    |
| Z.AI + Xiaomi MiMo  | Ambos usam `OPENAI_API_KEY` — conflito silencioso se usar ambos              |

## Arquivo

- **Localização:** `docs/PROVIDER_COMPATIBILITY.md`
- **Tamanho:** 883 linhas
- **Atualização:** Manual — deve ser atualizado quando novos providers ou features são adicionados
