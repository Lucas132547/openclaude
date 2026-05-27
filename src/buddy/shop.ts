import { getGlobalConfig, saveGlobalConfig } from '../utils/config.js'
import type { ShopItem, CompanionShop, ShopCategory } from './types.js'

// ─── Catálogo ────────────────────────────────────────────────────────────────

export const SHOP_ITEMS: ShopItem[] = [
  // Acessórios
  { id: 'oculos', name: 'Óculos Escuros', description: 'Buddy ganha óculos no sprite', price: 10, category: 'acessorios' },
  { id: 'mochila', name: 'Mochila', description: 'Mochilinha nas costas', price: 15, category: 'acessorios' },
  { id: 'asas', name: 'Asas de Anjo', description: 'Asas brilhantes', price: 20, category: 'acessorios' },
  { id: 'capa', name: 'Capa de Herói', description: 'Capa esvoaçante', price: 25, category: 'acessorios' },
  { id: 'chifres', name: 'Chifres', description: 'Chifres pequenos', price: 15, category: 'acessorios' },
  { id: 'coroa-flores', name: 'Coroa de Flores', description: 'Floral crown', price: 10, category: 'acessorios' },
  { id: 'bandana', name: 'Bandana Ninja', description: 'Faixa na testa', price: 12, category: 'acessorios' },
  { id: 'monoculo', name: 'Monóculo', description: 'Sofisticação clássica', price: 8, category: 'acessorios' },
  { id: 'laco', name: 'Laço/Bowtie', description: 'Formal buddy', price: 5, category: 'acessorios' },
  { id: 'aura', name: 'Aura Mágica', description: 'Brilho especial ao redor', price: 50, category: 'acessorios' },

  // Temas
  { id: 'fundo-noturno', name: 'Fundo Noturno', description: 'Estrelas ao fundo', price: 20, category: 'temas' },
  { id: 'fundo-oceanico', name: 'Fundo Oceânico', description: 'Ondas e bolhas', price: 20, category: 'temas' },
  { id: 'fundo-espacial', name: 'Fundo Espacial', description: 'Galáxia ao redor', price: 30, category: 'temas' },
  { id: 'fogo', name: 'Partículas de Fogo', description: 'Embers flutuantes', price: 40, category: 'temas' },
  { id: 'neve', name: 'Partículas de Neve', description: 'Snowflakes', price: 35, category: 'temas' },
  { id: 'glitch', name: 'Glitch Effect', description: 'Efeito visual digital', price: 45, category: 'temas' },
  { id: 'pixel-hearts', name: 'Pixel Hearts', description: 'Corações flutuantes', price: 25, category: 'temas' },

  // Títulos
  { id: 'titulo-comum', name: 'Título Comum', description: '"Code Apprentice"', price: 5, category: 'titulos' },
  { id: 'titulo-raro', name: 'Título Raro', description: '"Bug Destroyer"', price: 20, category: 'titulos' },
  { id: 'titulo-epico', name: 'Título Épico', description: '"Architect of Dreams"', price: 50, category: 'titulos' },
  { id: 'titulo-custom', name: 'Título Custom', description: 'Escolha seu texto', price: 100, category: 'titulos' },

  // Emotes
  { id: 'emote-comemorativo', name: 'Pack Comemorativo', description: '"Vamos celebrar!"', price: 15, category: 'emotes' },
  { id: 'emote-motivacional', name: 'Pack Motivacional', description: '"Você consegue!"', price: 15, category: 'emotes' },
  { id: 'emote-snarky', name: 'Pack Snarky', description: 'Humor ácido premium', price: 20, category: 'emotes' },
  { id: 'emote-zen', name: 'Pack Zen', description: 'Calma e foco', price: 10, category: 'emotes' },

  // Abilities com duração
  { id: 'quick-tips', name: 'Quick Tips', description: 'Dicas 100% por 2h', price: 20, category: 'abilities', duration: 2 * 60 * 60 * 1000 },
  { id: 'code-review-pro', name: 'Code Review Pro', description: 'Review 100% por 2h', price: 25, category: 'abilities', duration: 2 * 60 * 60 * 1000 },
  { id: 'xp-magnet', name: 'XP Magnet', description: '+25% XP por 1 dia', price: 50, category: 'abilities', duration: 24 * 60 * 60 * 1000 },
  { id: 'xp-boost', name: 'XP Boost', description: '2x XP por 2h', price: 15, category: 'abilities', duration: 2 * 60 * 60 * 1000 },
  { id: 'xp-shield', name: 'XP Shield', description: 'Bloqueia perdas por 1h', price: 15, category: 'abilities', duration: 60 * 60 * 1000 },
  { id: 'premium-hour', name: 'Premium Hour', description: 'Modo premium por 1h', price: 20, category: 'abilities', duration: 60 * 60 * 1000 },

  // Abilities passivas
  { id: 'memory-boost', name: 'Memory Boost', description: '30 memórias (vs 20)', price: 50, category: 'abilities' },
  { id: 'lucky-star', name: 'Lucky Star', description: '5% shiny no reroll', price: 60, category: 'abilities' },
  { id: 'deep-scan', name: 'Deep Scan', description: 'Mais patterns de erro', price: 35, category: 'abilities' },
  { id: 'streak-shield', name: 'Streak Shield', description: 'Protege streak 1 dia', price: 45, category: 'abilities' },

  // Abilities uso único
  { id: 'free-reroll', name: 'Free Reroll', description: 'Reroll grátis', price: 8, category: 'abilities' },
  { id: 'free-rename', name: 'Free Rename', description: 'Rename grátis', price: 3, category: 'abilities' },
  { id: 'skip-cooldown', name: 'Skip Cooldown', description: 'Pula cooldown', price: 5, category: 'abilities' },
  { id: 'force-evolve', name: 'Force Evolve', description: 'Força evolução', price: 50, category: 'abilities' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DEFAULT_SHOP: CompanionShop = {
  ownedAccessories: [],
  ownedThemes: [],
  ownedEmotes: [],
  ownedAbilities: [],
  activeAbilities: [],
  equippedAccessories: [],
  equippedTheme: null,
  equippedEmotes: null,
  equippedTitle: null,
  customTitle: null,
  xpShieldUntil: null,
  quickTipsUntil: null,
  codeReviewProUntil: null,
  xpBoostUntil: null,
  xpMagnetUntil: null,
  premiumUntil: null,
  nameGlowUntil: null,
  wallOfFameUntil: null,
  veteranLuckUnlocked: false,
  bugBuddyUnlocked: false,
  shieldUseCount: 0,
  luckyBlocks: 0,
}

export function getShop(): CompanionShop {
  return getGlobalConfig().companionShop ?? { ...DEFAULT_SHOP }
}

function saveShop(updater: (shop: CompanionShop) => CompanionShop): void {
  saveGlobalConfig(curr => ({
    ...curr,
    companionShop: updater(curr.companionShop ?? { ...DEFAULT_SHOP }),
  }))
}

export function getItemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find(i => i.id === id)
}

export function getItemsByCategory(category: ShopCategory): ShopItem[] {
  return SHOP_ITEMS.filter(i => i.category === category)
}

function getOwnedList(shop: CompanionShop, category: ShopCategory): string[] {
  switch (category) {
    case 'acessorios': return shop.ownedAccessories
    case 'temas': return shop.ownedThemes
    case 'emotes': return shop.ownedEmotes
    case 'abilities': return shop.ownedAbilities
    case 'titulos': return shop.ownedAccessories // títulos ficam em accessories
  }
}

function addToOwnedList(shop: CompanionShop, category: ShopCategory, id: string): CompanionShop {
  switch (category) {
    case 'acessorios': return { ...shop, ownedAccessories: [...shop.ownedAccessories, id] }
    case 'temas': return { ...shop, ownedThemes: [...shop.ownedThemes, id] }
    case 'emotes': return { ...shop, ownedEmotes: [...shop.ownedEmotes, id] }
    case 'abilities': return { ...shop, ownedAbilities: [...shop.ownedAbilities, id] }
    case 'titulos': return { ...shop, ownedAccessories: [...shop.ownedAccessories, id] }
  }
}

// ─── Buy ─────────────────────────────────────────────────────────────────────

export type BuyResult = {
  success: boolean
  message: string
}

export function buyItem(itemId: string): BuyResult {
  const item = getItemById(itemId)
  if (!item) return { success: false, message: `Item "${itemId}" não encontrado na loja.` }

  const config = getGlobalConfig()
  const xp = config.companion?.xp ?? 0
  const shop = getShop()

  // Verificar se já possui
  const owned = getOwnedList(shop, item.category)
  if (owned.includes(itemId)) {
    const isConsumable = ['free-reroll', 'free-rename', 'skip-cooldown', 'force-evolve'].includes(itemId)
    if (!isConsumable) {
      return { success: false, message: `Você já possui ${item.name}!` }
    }
  }

  if (xp < item.price) {
    return { success: false, message: `${item.name} custa ${item.price} XP. Você só tem ${xp} XP.` }
  }

  saveGlobalConfig(curr => ({
    ...curr,
    companion: curr.companion ? { ...curr.companion, xp: Math.round((xp - item.price) * 100) / 100 } : undefined,
  }))

  saveShop(curr => addToOwnedList(curr, item.category, itemId))

  if (item.category === 'abilities' && item.duration) {
    activateAbility(itemId, item.duration)
  }

  return { success: true, message: `${item.name} comprado! (-${item.price} XP)` }
}

export function addToInventory(itemId: string): void {
  const item = getItemById(itemId)
  if (!item) return
  saveShop(curr => addToOwnedList(curr, item.category, itemId))
}

// ─── Activate Ability ────────────────────────────────────────────────────────

function activateAbility(itemId: string, duration: number): void {
  const expiresAt = Date.now() + duration
  const fieldMap: Record<string, keyof CompanionShop> = {
    'quick-tips': 'quickTipsUntil',
    'code-review-pro': 'codeReviewProUntil',
    'xp-magnet': 'xpMagnetUntil',
    'xp-boost': 'xpBoostUntil',
    'xp-shield': 'xpShieldUntil',
    'premium-hour': 'premiumUntil',
  }

  const field = fieldMap[itemId]
  if (field) {
    saveShop(curr => ({ ...curr, [field]: expiresAt }))
  }
}

// ─── Equip ───────────────────────────────────────────────────────────────────

export type EquipResult = {
  success: boolean
  message: string
}

export function equipItem(itemId: string): EquipResult {
  const item = getItemById(itemId)
  if (!item) return { success: false, message: `Item "${itemId}" não encontrado.` }

  const shop = getShop()
  const owned = getOwnedList(shop, item.category)
  if (!owned.includes(itemId)) {
    return { success: false, message: `Você não possui ${item.name}. Compre na loja primeiro.` }
  }

  switch (item.category) {
    case 'acessorios': {
      if (shop.equippedAccessories.includes(itemId)) {
        return { success: false, message: `${item.name} já está equipado!` }
      }
      if (shop.equippedAccessories.length >= 3) {
        return { success: false, message: 'Máximo de 3 acessórios equipados. Desequipe um primeiro.' }
      }
      saveShop(curr => ({
        ...curr,
        equippedAccessories: [...curr.equippedAccessories, itemId],
      }))
      return { success: true, message: `${item.name} equipado!` }
    }
    case 'temas': {
      saveShop(curr => ({ ...curr, equippedTheme: itemId }))
      return { success: true, message: `Tema ${item.name} ativado!` }
    }
    case 'emotes': {
      saveShop(curr => ({ ...curr, equippedEmotes: itemId }))
      return { success: true, message: `Pack de emotes ${item.name} ativado!` }
    }
    case 'titulos': {
      saveShop(curr => ({ ...curr, equippedTitle: itemId }))
      return { success: true, message: 'Título equipado!' }
    }
    default:
      return { success: false, message: 'Esse item não pode ser equipado.' }
  }
}

export function unequipItem(itemId: string): EquipResult {
  const item = getItemById(itemId)
  if (!item) return { success: false, message: `Item "${itemId}" não encontrado.` }

  const shop = getShop()

  switch (item.category) {
    case 'acessorios': {
      if (!shop.equippedAccessories.includes(itemId)) {
        return { success: false, message: `${item.name} não está equipado.` }
      }
      saveShop(curr => ({
        ...curr,
        equippedAccessories: curr.equippedAccessories.filter(id => id !== itemId),
      }))
      return { success: true, message: `${item.name} desequipado.` }
    }
    case 'temas': {
      saveShop(curr => ({ ...curr, equippedTheme: null }))
      return { success: true, message: 'Tema removido.' }
    }
    case 'emotes': {
      saveShop(curr => ({ ...curr, equippedEmotes: null }))
      return { success: true, message: 'Emotes removidos.' }
    }
    case 'titulos': {
      saveShop(curr => ({ ...curr, equippedTitle: null }))
      return { success: true, message: 'Título removido.' }
    }
    default:
      return { success: false, message: 'Esse item não pode ser desequipado.' }
  }
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export function getInventory(): { owned: ShopItem[]; equipped: string[] } {
  const shop = getShop()
  const allOwned = [
    ...shop.ownedAccessories,
    ...shop.ownedThemes,
    ...shop.ownedEmotes,
    ...shop.ownedAbilities,
  ]
  const owned = allOwned
    .map(id => getItemById(id))
    .filter((item): item is ShopItem => !!item)

  const equipped = [
    ...shop.equippedAccessories,
    ...(shop.equippedTheme ? [shop.equippedTheme] : []),
    ...(shop.equippedEmotes ? [shop.equippedEmotes] : []),
    ...(shop.equippedTitle ? [shop.equippedTitle] : []),
  ]

  return { owned, equipped }
}

// ─── Format Shop ─────────────────────────────────────────────────────────────

export function formatShop(category?: ShopCategory): string {
  const xp = getGlobalConfig().companion?.xp ?? 0
  const shop = getShop()
  const categories = category ? [category] : ['acessorios', 'temas', 'titulos', 'emotes', 'abilities'] as ShopCategory[]

  const lines: string[] = [`🛒 Loja do Buddy — Você tem ${xp} XP\n`]

  for (const cat of categories) {
    const items = getItemsByCategory(cat)
    const catName = { acessorios: '🎨 Acessórios', temas: '🌌 Temas', titulos: '🏷️ Títulos', emotes: '💬 Emotes', abilities: '⚡ Abilities' }[cat]
    lines.push(`${catName}:`)

    for (const item of items) {
      const owned = getOwnedList(shop, cat).includes(item.id)
      const equipped = shop.equippedAccessories.includes(item.id) || shop.equippedTheme === item.id || shop.equippedEmotes === item.id || shop.equippedTitle === item.id
      const status = equipped ? ' ✅' : owned ? ' 🔓' : ''
      const duration = item.duration ? ` (${formatDuration(item.duration)})` : ''
      lines.push(`  ${item.name} — ${item.price} XP${duration}${status} — ${item.description}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

function formatDuration(ms: number): string {
  if (ms >= 24 * 60 * 60 * 1000) return `${ms / (24 * 60 * 60 * 1000)}d`
  if (ms >= 60 * 60 * 1000) return `${ms / (60 * 60 * 1000)}h`
  return `${ms / (60 * 1000)}min`
}

// ─── Lucky Draw ──────────────────────────────────────────────────────────────

export type DrawResult = {
  item: ShopItem
  jackpot: boolean
}

export function luckyDraw(tier: 'common' | 'rare' | 'epic'): DrawResult {
  const maxPrice = tier === 'common' ? 15 : tier === 'rare' ? 40 : 999
  const pool = SHOP_ITEMS.filter(i => i.price <= maxPrice)
  const item = pool[Math.floor(Math.random() * pool.length)]!

  const jackpot = Math.random() < 0.05
  if (jackpot && tier !== 'epic') {
    const nextTier = tier === 'common' ? 'rare' : 'epic'
    return luckyDraw(nextTier)
  }

  return { item, jackpot }
}

// ─── Ability Checks (for observer integration) ──────────────────────────────

export function isQuickTipsActive(): boolean {
  const until = getShop().quickTipsUntil
  return until !== null && until > Date.now()
}

export function isCodeReviewProActive(): boolean {
  const until = getShop().codeReviewProUntil
  return until !== null && until > Date.now()
}

export function isXpBoostActive(): boolean {
  const until = getShop().xpBoostUntil
  return until !== null && until > Date.now()
}

export function isXpMagnetActive(): boolean {
  const until = getShop().xpMagnetUntil
  return until !== null && until > Date.now()
}

export function isXpShieldActive(): boolean {
  const until = getShop().xpShieldUntil
  return until !== null && until > Date.now()
}

export function hasAbility(itemId: string): boolean {
  const shop = getShop()
  return shop.ownedAbilities.includes(itemId)
}
