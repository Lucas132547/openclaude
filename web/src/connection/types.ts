import type { ClientMessage, ServerMessage } from '../types/proto'

export interface ConnectionConfig {
  /** WebSocket URL, e.g. ws://localhost:3000/ws */
  url: string
  /** Optional auth token */
  authToken?: string
}

export interface Connection {
  /** Send a client message to the server */
  send(msg: ClientMessage): void
  /** Register a handler for incoming server messages */
  onMessage(handler: (msg: ServerMessage) => void): void
  /** Register a handler for connection open */
  onOpen(handler: () => void): void
  /** Register a handler for connection close */
  onClose(handler: () => void): void
  /** Register a handler for errors */
  onError(handler: (err: Event) => void): void
  /** Close the connection */
  close(): void
  /** Whether the connection is currently open */
  isConnected(): boolean
}
