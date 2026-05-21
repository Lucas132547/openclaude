import { useChatStore, type ChatState } from '../stores/chatStore'
import type { ConnectionStatus } from '../types/chat'

const statusConfig: Record<
  ConnectionStatus,
  { label: string; color: string; dot: string }
> = {
  disconnected: {
    label: 'disconnected',
    color: 'text-muted',
    dot: 'bg-gray-400',
  },
  connecting: {
    label: 'connecting...',
    color: 'text-amber-400',
    dot: 'bg-amber-400 animate-pulse-dot',
  },
  connected: {
    label: 'connected',
    color: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  error: {
    label: 'error',
    color: 'text-red-400',
    dot: 'bg-red-400',
  },
}

export function StatusBadge() {
  const status = useChatStore((s: ChatState) => s.connectionStatus) as ConnectionStatus
  const cfg = statusConfig[status]

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}
