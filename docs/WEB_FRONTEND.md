# Web Frontend - Chat Interface

## Utilidade

Interface web para interagir com o OpenClaude CLI sem usar o terminal. Conecta-se ao servidor headless do OpenClaude via WebSocket, permitindo conversar com o agente de coding através de um navegador com streaming em tempo real, exibição de tool calls, e histórico de conversas.

## Como utilizar

### 1. Iniciar o servidor OpenClaude

```bash
cd openclaude
# Iniciar em modo headless (WebSocket server)
# A porta padrão deve estar configurada nas variáveis de ambiente
```

### 2. Iniciar o frontend web

```bash
cd web
bun install
bun dev
```

O servidor de desenvolvimento inicia em `http://localhost:5173`.

### 3. Conectar

1. Abra `http://localhost:5173/chat`
2. Na sidebar, insira a URL do servidor OpenClace (ex: `ws://localhost:PORT`)
3. Clique em "Connect"
4. Comece a conversar!

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│  Browser (React + Zustand + Tailwind)                   │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐             │
│  │ Sidebar  │  │ ChatView │  │ ToolCalls │             │
│  │          │  │          │  │           │             │
│  │ Connect  │  │ Messages │  │ Collapsed │             │
│  │ History  │  │ Input    │  │ Colored   │             │
│  │ Settings │  │ Stream   │  │ Diffs     │             │
│  └──────────┘  └──────────┘  └───────────┘             │
│       │              │              │                   │
│       └──────────────┴──────────────┘                   │
│                      │                                  │
│              ┌───────┴───────┐                          │
│              │  chatStore    │  (Zustand)               │
│              │  messages[]   │                          │
│              │  streaming    │                          │
│              │  toolCalls[]  │                          │
│              └───────┬───────┘                          │
│                      │                                  │
│              ┌───────┴───────┐                          │
│              │  WebSocket    │  (singleton)             │
│              └───────┬───────┘                          │
└──────────────────────┼──────────────────────────────────┘
                       │ JSON messages
                       ▼
              ┌─────────────────┐
              │ OpenClaude CLI  │
              │ (headless mode) │
              └─────────────────┘
```

## Componentes

| Componente         | Arquivo                           | Função                             |
| ------------------ | --------------------------------- | ---------------------------------- |
| `ChatLayout`       | `pages/ChatLayout.tsx`            | Layout principal: sidebar + chat   |
| `Landing`          | `pages/Landing.tsx`               | Página inicial/marketing           |
| `Sidebar`          | `components/Sidebar.tsx`          | Conexão, histórico, settings       |
| `ChatView`         | `components/ChatView.tsx`         | Lista de mensagens com auto-scroll |
| `MessageBubble`    | `components/MessageBubble.tsx`    | Renderização de mensagem por role  |
| `MessageInput`     | `components/MessageInput.tsx`     | Campo de entrada auto-expansível   |
| `ToolCallDisplay`  | `components/ToolCallDisplay.tsx`  | Tool calls colapsáveis com diffs   |
| `MarkdownRenderer` | `components/MarkdownRenderer.tsx` | Markdown com syntax highlighting   |
| `StatusBadge`      | `components/StatusBadge.tsx`      | Badge de status de conexão         |

## Stores (Zustand)

### chatStore

- `messages[]` — Histórico de mensagens da conversa atual
- `isStreaming` — Se está recebendo resposta
- `currentText` — Texto sendo streamado
- `connectionStatus` — Estado da conexão WebSocket
- `conversations[]` — Histórico de conversas salvas (até 50)
- `pendingPrompt` — Prompt de permissão pendente

### settingsStore

- `serverUrl` — URL do servidor OpenClaude
- `authToken` — Token de autenticação
- `workingDirectory` — Diretório de trabalho
- `modelOverride` — Modelo alternativo
- `autoApproveTools` — Auto-aprovar tools sem pedir permissão
- `theme` — Tema (dark/light)

## Protocolo WebSocket

### Cliente → Servidor

```json
// Enviar mensagem
{ "request": { "message": "faça X", "working_directory": "/path", "session_id": "..." } }

// Responder a permissão
{ "input": { "reply": "approve", "prompt_id": "..." } }

// Cancelar operação
{ "cancel": { "reason": "User cancelled" } }
```

### Servidor → Cliente

```json
// Streaming de texto
{ "delta": { "text": "pensando..." } }

// Tool call iniciado
{ "tool_use": { "id": "...", "name": "Bash", "input": {...} } }

// Resultado de tool call
{ "tool_result": { "tool_use_id": "...", "output": "..." } }

// Resposta completa
{ "done": { "text": "resposta final", "usage": {...} } }
```

## Quando utilizar

- **Quando prefere interface gráfica** ao terminal
- **Para demonstrações** — mostra o agente em ação de forma visual
- **Para monitoramento** — acompanhe tool calls e streaming em tempo real
- **Para acesso remoto** — conecte-se ao servidor OpenClace de qualquer máquina

## Tecnologias

- React 19 + TypeScript (strict mode)
- Zustand para estado
- Tailwind CSS para estilos
- Vite para build/dev
- react-markdown + remark-gfm para markdown
- react-syntax-highlighter para blocos de código
- lucide-react para ícones

## Estrutura de arquivos

```
web/
├── src/
│   ├── components/
│   │   ├── ChatView.tsx
│   │   ├── MarkdownRenderer.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageInput.tsx
│   │   ├── Sidebar.tsx
│   │   ├── StatusBadge.tsx
│   │   └── ToolCallDisplay.tsx
│   ├── connection/
│   │   ├── types.ts
│   │   └── websocket.ts
│   ├── hooks/
│   │   └── useConnection.ts
│   ├── pages/
│   │   ├── ChatLayout.tsx
│   │   └── Landing.tsx
│   ├── stores/
│   │   ├── chatStore.ts
│   │   └── settingsStore.ts
│   ├── types/
│   │   ├── chat.ts
│   │   └── proto.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── styles.css
│   └── content.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```
