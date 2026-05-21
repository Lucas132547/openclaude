import type { ClientMessage, ServerMessage } from '../types/proto'
import type { Connection, ConnectionConfig } from './types'

/**
 * WebSocket-based connection to the OpenClaude server.
 *
 * The server exposes a WebSocket endpoint that accepts JSON-encoded
 * messages matching the gRPC proto definitions. This allows browsers
 * to communicate without needing a gRPC-Web proxy.
 */
export function createWebSocketConnection(
  config: ConnectionConfig,
): Connection {
  let ws: WebSocket | null = null
  const messageHandlers: Array<(msg: ServerMessage) => void> = []
  const openHandlers: Array<() => void> = []
  const closeHandlers: Array<() => void> = []
  const errorHandlers: Array<(err: Event) => void> = []

  function connect(): void {
    const protocols = config.authToken
      ? [`openclaude.${config.authToken}`]
      : undefined

    ws = new WebSocket(config.url, protocols)

    ws.onopen = () => {
      for (const h of openHandlers) h()
    }

    ws.onmessage = (event) => {
      try {
        const lines = (event.data as string).split('\n').filter(l => l.trim())
        for (const line of lines) {
          const msg = JSON.parse(line) as ServerMessage
          for (const h of messageHandlers) h(msg)
        }
      } catch {
        // Single message (not newline-delimited)
        try {
          const msg = JSON.parse(event.data as string) as ServerMessage
          for (const h of messageHandlers) h(msg)
        } catch {
          console.warn('[ws] Failed to parse message:', event.data)
        }
      }
    }

    ws.onclose = () => {
      for (const h of closeHandlers) h()
    }

    ws.onerror = (err) => {
      for (const h of errorHandlers) h(err)
    }
  }

  // Connect immediately
  connect()

  return {
    send(msg: ClientMessage) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(msg))
      }
    },

    onMessage(handler) {
      messageHandlers.push(handler)
    },

    onOpen(handler) {
      openHandlers.push(handler)
      // If already connected, fire immediately
      if (ws && ws.readyState === WebSocket.OPEN) handler()
    },

    onClose(handler) {
      closeHandlers.push(handler)
    },

    onError(handler) {
      errorHandlers.push(handler)
    },

    close() {
      ws?.close()
      ws = null
    },

    isConnected() {
      return ws?.readyState === WebSocket.OPEN
    },
  }
}

/**
 * gRPC-Web connection (for use with a gRPC-Web proxy like Envoy or
 * grpcwebproxy). This uses the standard fetch-based gRPC-Web protocol.
 *
 * Note: requires a proxy that translates gRPC-Web → gRPC.
 * Not needed if the server exposes a WebSocket endpoint directly.
 */
export function createGrpcWebConnection(
  _config: ConnectionConfig,
): Connection {
  // gRPC-Web requires @connectrpc/connect-web or similar library
  // For now, throw — the WebSocket connection is the primary path
  throw new Error(
    'gRPC-Web connection not yet implemented. Use WebSocket mode. ' +
    'To use gRPC-Web, run a proxy like grpcwebproxy between the browser and server.',
  )
}
