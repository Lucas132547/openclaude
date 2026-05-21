/**
 * Application-level types for the chat UI.
 * Higher-level than proto types — these represent what the UI renders.
 */

export type MessageRole = 'user' | 'assistant' | 'system'

export type ToolState = 'running' | 'completed' | 'error'

export interface ToolCall {
  id: string
  toolName: string
  arguments: Record<string, unknown>
  argumentsRaw: string
  state: ToolState
  output?: string
  isError?: boolean
  collapsed: boolean
}

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: number
  toolCalls: ToolCall[]
  tokenUsage?: { prompt: number; completion: number }
}

export interface PendingPrompt {
  promptId: string
  question: string
  type: 'CONFIRM_COMMAND' | 'REQUEST_INFORMATION' | string
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  workingDirectory: string
  model?: string
  createdAt: number
  updatedAt: number
}

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'
