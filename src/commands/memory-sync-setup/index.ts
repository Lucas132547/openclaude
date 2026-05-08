import type { Command } from '../../commands.js'

const memorySyncSetup: Command = {
  type: 'local-jsx',
  name: 'memory-sync-setup',
  description: 'Setup automatic git hook to sync global memory into the local repository.',
  load: () => import('./memorySyncSetup.js'),
}

export default memorySyncSetup
