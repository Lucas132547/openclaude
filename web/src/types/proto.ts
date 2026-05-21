/**
 * TypeScript types mirroring the openclaude.proto definitions.
 * These represent the wire format for the gRPC/WS chat protocol.
 */

// ─── Client → Server ────────────────────────────────────────────────────

export type ClientMessage =
  | { request: ChatRequest }
  | { input: UserInput }
  | { cancel: CancelSignal }

export interface ChatRequest {
  message: string
  working_directory?: string
  model?: string
  session_id?: string
}

export interface UserInput {
  reply: string
  prompt_id: string
}

export interface CancelSignal {
  reason?: string
}

// ─── Server → Client ────────────────────────────────────────────────────

export type ServerMessage =
  | { text_chunk: TextChunk }
  | { tool_start: ToolCallStart }
  | { tool_result: ToolCallResult }
  | { action_required: ActionRequired }
  | { done: FinalResponse }
  | { error: ErrorResponse }

export interface TextChunk {
  text: string
}

export interface ToolCallStart {
  tool_name: string
  arguments_json: string
  tool_use_id: string
}

export interface ToolCallResult {
  tool_name: string
  output: string
  is_error: boolean
  tool_use_id: string
}

export interface ActionRequired {
  prompt_id: string
  question: string
  type: 'CONFIRM_COMMAND' | 'REQUEST_INFORMATION' | string
}

export interface FinalResponse {
  full_text: string
  prompt_tokens: number
  completion_tokens: number
}

export interface ErrorResponse {
  message: string
  code: string
}
