import { create } from 'zustand'
import type {
  ChatMessage,
  ConnectionStatus,
  Conversation,
  PendingPrompt,
  ToolCall,
} from '../types/chat'
import type { Connection } from '../connection/types'
import type { ServerMessage, ClientMessage } from '../types/proto'

// Zustand helper types (module types unavailable at compile time)
type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void
type GetState<T> = () => T

function generateId(): string {
  return crypto.randomUUID()
}

function makeMessage(
  role: ChatMessage['role'],
  content: string,
): ChatMessage {
  return {
    id: generateId(),
    role,
    content,
    timestamp: Date.now(),
    toolCalls: [],
  }
}

export interface ChatState {
  // ─── Connection ─────────────────────────────────────────
  connectionStatus: ConnectionStatus
  connection: Connection | null

  // ─── Current conversation ───────────────────────────────
  messages: ChatMessage[]
  isStreaming: boolean
  currentText: string
  streamStartTime: number | null
  pendingPrompt: PendingPrompt | null
  sessionId: string

  // ─── History ────────────────────────────────────────────
  conversations: Conversation[]

  // ─── Actions ────────────────────────────────────────────
  setConnection: (conn: Connection | null) => void
  setConnectionStatus: (status: ConnectionStatus) => void
  addMessage: (msg: ChatMessage) => void
  updateLastAssistant: (updater: (msg: ChatMessage) => ChatMessage) => void
  appendToCurrentText: (text: string) => void
  startStreaming: () => void
  stopStreaming: () => void
  setPendingPrompt: (prompt: PendingPrompt | null) => void
  addToolCall: (toolCall: ToolCall) => void
  updateToolCall: (
    toolUseId: string,
    updater: (tc: ToolCall) => ToolCall,
  ) => void
  finalizeResponse: (fullText: string, promptTokens: number, completionTokens: number) => void
  setSessionId: (id: string) => void
  clearChat: () => void
  loadConversation: (conv: Conversation) => void
  deleteConversation: (id: string) => void

  // ─── Send helpers ───────────────────────────────────────
  sendMessage: (text: string, workingDirectory: string, model?: string) => void
  sendPermissionReply: (promptId: string, reply: string) => void
  cancelRequest: () => void
}

export const useChatStore = create<ChatState>((
  set: SetState<ChatState>,
  get: GetState<ChatState>,
): ChatState => ({
  connectionStatus: 'disconnected',
  connection: null,
  messages: [],
  isStreaming: false,
  currentText: '',
  streamStartTime: null,
  pendingPrompt: null,
  sessionId: generateId(),
  conversations: [],

  setConnection: (conn) => set({ connection: conn }),

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  updateLastAssistant: (updater) =>
    set((s) => {
      const msgs = [...s.messages]
      const lastIdx = msgs.length - 1
      if (lastIdx >= 0 && msgs[lastIdx].role === 'assistant') {
        msgs[lastIdx] = updater(msgs[lastIdx])
      }
      return { messages: msgs }
    }),

  appendToCurrentText: (text) =>
    set((s) => {
      const newState: Partial<ChatState> = { currentText: s.currentText + text }
      // Update assistant timestamp on first content arrival
      if (s.currentText === '' && text) {
        const msgs = [...s.messages]
        const lastIdx = msgs.length - 1
        if (lastIdx >= 0 && msgs[lastIdx].role === 'assistant' && msgs[lastIdx].timestamp === 0) {
          msgs[lastIdx] = { ...msgs[lastIdx], timestamp: Date.now() }
          newState.messages = msgs
        }
      }
      return newState
    }),

  startStreaming: () =>
    set({
      isStreaming: true,
      currentText: '',
      streamStartTime: Date.now(),
      pendingPrompt: null,
    }),

  stopStreaming: () => set({ isStreaming: false, currentText: '', streamStartTime: null }),

  setPendingPrompt: (prompt) => set({ pendingPrompt: prompt }),

  addToolCall: (toolCall) =>
    set((s) => {
      const msgs = [...s.messages]
      const lastIdx = msgs.length - 1
      if (lastIdx >= 0 && msgs[lastIdx].role === 'assistant') {
        msgs[lastIdx] = {
          ...msgs[lastIdx],
          toolCalls: [...msgs[lastIdx].toolCalls, toolCall],
        }
      }
      return { messages: msgs }
    }),

  updateToolCall: (toolUseId, updater) =>
    set((s) => {
      const msgs = [...s.messages]
      for (let i = msgs.length - 1; i >= 0; i--) {
        const tcIdx = msgs[i].toolCalls.findIndex(
          (tc) => tc.id === toolUseId,
        )
        if (tcIdx >= 0) {
          const toolCalls = [...msgs[i].toolCalls]
          toolCalls[tcIdx] = updater(toolCalls[tcIdx])
          msgs[i] = { ...msgs[i], toolCalls }
          break
        }
      }
      return { messages: msgs }
    }),

  finalizeResponse: (fullText, promptTokens, completionTokens) =>
    set((s) => {
      const msgs = [...s.messages]
      const lastIdx = msgs.length - 1
      if (lastIdx >= 0 && msgs[lastIdx].role === 'assistant') {
        msgs[lastIdx] = {
          ...msgs[lastIdx],
          content: fullText || msgs[lastIdx].content,
          tokenUsage: { prompt: promptTokens, completion: completionTokens },
        }
      }
      // Save to conversations — preserve original createdAt
      const existingConv = s.conversations.find((c) => c.id === s.sessionId)
      const conv: Conversation = {
        id: s.sessionId,
        title: s.messages.find((m) => m.role === 'user')?.content.slice(0, 60) || 'New conversation',
        messages: msgs,
        workingDirectory: '',
        createdAt: existingConv?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
      }
      const existing = s.conversations.filter((c) => c.id !== conv.id)
      return {
        messages: msgs,
        isStreaming: false,
        currentText: '',
        streamStartTime: null,
        conversations: [conv, ...existing].slice(0, 50),
      }
    }),

  setSessionId: (id) => set({ sessionId: id }),

  clearChat: () =>
    set({
      messages: [],
      isStreaming: false,
      currentText: '',
      pendingPrompt: null,
      sessionId: generateId(),
    }),

  loadConversation: (conv) =>
    set({
      messages: conv.messages,
      sessionId: conv.id,
      isStreaming: false,
      currentText: '',
      pendingPrompt: null,
    }),

  deleteConversation: (id) =>
    set((s) => ({
      conversations: s.conversations.filter((c) => c.id !== id),
    })),

  sendMessage: (text, workingDirectory, model) => {
    const { connection, sessionId, messages, addMessage, startStreaming } = get()

    // Add user message to UI
    addMessage(makeMessage('user', text))

    // Create placeholder assistant message for streaming (timestamp 0 — will be set on first content)
    addMessage({ id: generateId(), role: 'assistant', content: '', timestamp: 0, toolCalls: [] })

    startStreaming()

    // Send to server
    const msg: ClientMessage = {
      request: {
        message: text,
        working_directory: workingDirectory,
        session_id: sessionId,
        ...(model ? { model } : {}),
      },
    }
    connection?.send(msg)
  },

  sendPermissionReply: (promptId, reply) => {
    const { connection } = get()
    const msg: ClientMessage = {
      input: { reply, prompt_id: promptId },
    }
    connection?.send(msg)
    set({ pendingPrompt: null })
  },

  cancelRequest: () => {
    const { connection } = get()
    const msg: ClientMessage = { cancel: { reason: 'User cancelled' } }
    connection?.send(msg)
    set({ isStreaming: false, streamStartTime: null })
  },
}))
