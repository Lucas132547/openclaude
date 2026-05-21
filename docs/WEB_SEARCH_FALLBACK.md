# Web Search Fallback Chain

## Utilidade

O sistema de busca web do OpenClaude agora usa uma **cadeia de fallback inteligente** em vez de depender de um único provider. Se o provider principal falhar (rate-limit, bloqueio, erro de rede), o sistema automaticamente tenta o próximo provider disponível, até encontrar um que funcione ou exibir uma mensagem de erro clara e acionável.

Isso resolve o problema anterior onde o DuckDuckGo (scraping) era o único padrão para modelos não-Anthropic, e falhava silenciosamente quando era bloqueado ou rate-limited.

## Como utilizar

### Configuração básica (recomendada)

No seu `settings.json` ou variável de ambiente:

```bash
# Opcional: chave da Brave Search (melhor opção gratuita)
export BRAVE_API_KEY="sua-chave-aqui"

# Opcional: modo do provider (padrão é "auto")
export WEB_SEARCH_PROVIDER="auto"
```

### Modos de operação

| Modo            | Comportamento                                               |
| --------------- | ----------------------------------------------------------- |
| `auto` (padrão) | Tenta providers em ordem de prioridade, fallback silencioso |
| `brave`         | Apenas Brave Search (falha se não configurado)              |
| `ddg`           | Apenas DuckDuckGo scraping                                  |
| `firecrawl`     | Apenas Firecrawl                                            |
| `tavily`        | Apenas Tavily                                               |
| `exa`           | Apenas Exa                                                  |
| `native`        | Apenas Anthropic nativo / Codex                             |

### Ordem de prioridade (modo auto)

```
firecrawl → tavily → exa → you → jina → brave → bing → mojeek → linkup → ddg
```

DuckDuckGo é último porque é gratuito mas sujeito a rate-limiting. Brave fica à frente do Bing porque tem um índice independente e tier gratuito utilizável.

### Configurando Brave Search (recomendado)

1. Acesse https://brave.com/search/api/
2. Crie uma conta e gere uma API key (plano gratuito: 2.000 queries/mês)
3. Adicione ao seu ambiente:
   ```bash
   export BRAVE_API_KEY="BSA..."
   ```

## Quando utilizar

- **Sempre que usar web search** com modelos não-Anthropic
- **Em produção/CI** onde confiabilidade importa — configure pelo menos `BRAVE_API_KEY`
- **Para debugging** — use `WEB_SEARCH_PROVIDER=brave` para isolar problemas de um provider específico

## O que acontece quando todos falham

Em vez de um erro genérico, o usuário recebe:

```
Web search failed in auto mode.

Recommended fix:
1. Set BRAVE_API_KEY — fast, reliable, free tier (https://brave.com/search/api)
2. Or set one of: FIRECRAWL_API_KEY, TAVILY_API_KEY, EXA_API_KEY

DuckDuckGo (no key needed) was tried last but returned no results.
This often means DDG is rate-limiting or blocking automated requests.
```

## Arquivos alterados

| Arquivo                                              | Mudança                                                          |
| ---------------------------------------------------- | ---------------------------------------------------------------- |
| `src/tools/WebSearchTool/providers/index.ts`         | Função `buildAllProvidersFailedError()` com mensagens acionáveis |
| `src/tools/WebSearchTool/providers/duckduckgo.ts`    | Hint de anomalia recomenda `BRAVE_API_KEY` primeiro              |
| `src/tools/WebSearchTool/WebSearchTool.ts`           | Guia de 3 passos em erros de adapter                             |
| `src/tools/WebSearchTool/README_SEARCH_PROVIDERS.md` | Documentação atualizada com fallback chain                       |
| `.env.example`                                       | `BRAVE_API_KEY` listada primeiro com contexto                    |
