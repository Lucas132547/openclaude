import { getCompanion } from './companion.js'

export type ReminderState = {
  sessionStartTime: number
  lastActivityTime: number
  hasTriggeredSessionReminder: boolean
  hasTriggeredIdleReminder: boolean
}

export const initialReminderState: ReminderState = {
  sessionStartTime: Date.now(),
  lastActivityTime: Date.now(),
  hasTriggeredSessionReminder: false,
  hasTriggeredIdleReminder: false,
}

// Global state for default usage
let globalState = { ...initialReminderState }

// Constants for time
export const ONE_HOUR = 60 * 60 * 1000
export const FIFTEEN_MINS = 15 * 60 * 1000

export function updateActivityTracker(state: ReminderState = globalState, now = Date.now()) {
  state.lastActivityTime = now
  state.hasTriggeredIdleReminder = false
}

export function checkProductivityReminders(
  state: ReminderState = globalState,
  now = Date.now(),
): string | null {
  const companion = getCompanion()
  if (!companion) return null

  const timeSinceStart = now - state.sessionStartTime
  const timeSinceLastAction = now - state.lastActivityTime

  // 1. Session reminder (working for too long)
  if (timeSinceStart > ONE_HOUR && !state.hasTriggeredSessionReminder) {
    state.hasTriggeredSessionReminder = true

    const sessionMessages = [
      "Wow, one full hour already! Don't forget to blink and hydrate! 💧",
      "Time flies when you're coding! You've been at it for an hour. Maybe stretch those legs? 🏃‍♂️",
      "Hey! 1 hour milestone reached! Let's take a quick break to rest those eyes. 👀",
      "You're on fire! 🔥 But even machines need a cool-down. It's been an hour!",
    ]
    return sessionMessages[Math.floor(Math.random() * sessionMessages.length)]!
  }

  // 2. Idle reminder (stuck on something)
  if (timeSinceLastAction > FIFTEEN_MINS && !state.hasTriggeredIdleReminder) {
    state.hasTriggeredIdleReminder = true

    const idleMessages = [
      "Everything okay? I've been waiting for 15 minutes. Need help debugging? 🐛",
      "Are we stuck, or just taking a well-deserved coffee break? ☕",
      "If you're staring at a weird bug, maybe I can help you solve it! 🕵️",
      "Still there? Sometimes a quick walk is all it takes to find the solution! 🚶‍♀️",
    ]
    return idleMessages[Math.floor(Math.random() * idleMessages.length)]!
  }

  return null
}
