# Changelog — Sessão 2026-05-21

Resumo de todas as mudanças feitas nesta sessão.

## Novas funcionalidades

| Feature                       | Documentação                                                                                                                | Arquivos principais                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Web Search Fallback Chain     | [WEB_SEARCH_FALLBACK.md](WEB_SEARCH_FALLBACK.md)                                                                            | `src/tools/WebSearchTool/providers/index.ts` |
| Provider Compatibility Matrix | [PROVIDER_COMPATIBILITY_GUIDE.md](PROVIDER_COMPATIBILITY_GUIDE.md) + [PROVIDER_COMPATIBILITY.md](PROVIDER_COMPATIBILITY.md) | `docs/PROVIDER_COMPATIBILITY.md`             |
| Citations Streaming           | [CITATIONS_STREAMING.md](CITATIONS_STREAMING.md)                                                                            | `src/services/api/claude.ts`                 |
| Web Frontend (Chat UI)        | [WEB_FRONTEND.md](WEB_FRONTEND.md)                                                                                          | `web/src/` (17 arquivos)                     |

## Correções

| Fix                                   | Documentação                             | Arquivos principais                                                  |
| ------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------- |
| Testes quebrados (3)                  | [TEST_FIXES.md](TEST_FIXES.md)           | `geminiOAuth.ts`, `providerValidation.test.ts`, `openaiShim.test.ts` |
| Cleanup (package-lock, compact, REPL) | [CLEANUP_CHANGES.md](CLEANUP_CHANGES.md) | `compact.ts`, `REPL.tsx`, `CompanionSprite.tsx`                      |

## Commits não enviados (buddy system)

Esses commits já existem no histórico local mas não foram pushed:

```
a69c88c fix: padroniza todas as mensagens do buddy para PT-BR
bef91e8 feat(buddy): add companion memory system
fe46463 feat(buddy): add companion outfit system with achievement unlocks
f136aec feat: add skill unlock system for buddy companion
74ca77e feat(buddy): add /buddy brincar and /buddy alimentar interactive commands
26a8a5e feat(buddy): add git status awareness to companion observer
d10b889 feat(buddy): add /buddy stats command and companion stats tracking
f4592be feat: add dynamic mood system for buddy companion
21b2c35 feat(buddy): add daily streak system and easter eggs
577c7da refactor: deduplicate hashString, fix UTC date, translate PT→EN, remove dead code
1fd2df5 fix(buddy): make observer reactions deterministic
```

## Arquivos não commitados (sessão atual)

### Modificados (21)

```
 .env.example
 src/buddy/CompanionSprite.tsx
 src/screens/REPL.tsx
 src/services/api/claude.ts
 src/services/api/geminiOAuth.ts
 src/services/api/openaiShim.test.ts
 src/services/compact/compact.ts
 src/tools/WebSearchTool/README_SEARCH_PROVIDERS.md
 src/tools/WebSearchTool/WebSearchTool.ts
 src/tools/WebSearchTool/providers/duckduckgo.ts
 src/tools/WebSearchTool/providers/index.ts
 src/utils/managedEnvConstants.ts
 src/utils/providerValidation.test.ts
 src/utils/providerValidation.ts
 web/bun.lock
 web/index.html
 web/package.json
 web/src/App.tsx
 web/src/main.tsx
 web/src/styles.css
 web/vite.config.ts
```

### Novos (20)

```
 docs/PROVIDER_COMPATIBILITY.md
 docs/buddy.md
 docs/CITATIONS_STREAMING.md
 docs/CLEANUP_CHANGES.md
 docs/PROVIDER_COMPATIBILITY_GUIDE.md
 docs/TEST_FIXES.md
 docs/WEB_FRONTEND.md
 docs/WEB_SEARCH_FALLBACK.md
 web/postcss.config.js
 web/src/components/ChatView.tsx
 web/src/components/MarkdownRenderer.tsx
 web/src/components/MessageBubble.tsx
 web/src/components/MessageInput.tsx
 web/src/components/Sidebar.tsx
 web/src/components/StatusBadge.tsx
 web/src/components/ToolCallDisplay.tsx
 web/src/connection/types.ts
 web/src/connection/websocket.ts
 web/src/hooks/useConnection.ts
 web/src/pages/ChatLayout.tsx
 web/src/pages/Landing.tsx
 web/src/stores/chatStore.ts
 web/src/stores/settingsStore.ts
 web/src/types/chat.ts
 web/src/types/proto.ts
 web/tailwind.config.js
```

## Próximos passos sugeridos

1. **Commit** — Agrupar as mudanças em commits semânticos
2. **Push** — Enviar commits locais do buddy + mudanças da sessão
3. **Testar web frontend** — Conectar ao servidor OpenClaude headless
4. **Atualizar README** — Adicionar seção sobre web frontend e provider matrix
