import { getCompanion } from './companion.js'

// Track the global session
let sessionStartTime = Date.now()
let lastActivityTime = Date.now()
let hasTriggeredSessionReminder = false
let hasTriggeredIdleReminder = false

// Constants for time
const ONE_HOUR = 60 * 60 * 1000
const FIFTEEN_MINS = 15 * 60 * 1000

export function updateActivityTracker() {
  lastActivityTime = Date.now()
  // If the user came back after a very long break, maybe reset the session?
  // Let's just track activity for now.
  hasTriggeredIdleReminder = false
}

export function checkProductivityReminders(): string | null {
  const companion = getCompanion()
  if (!companion) return null

  const now = Date.now()
  const timeSinceStart = now - sessionStartTime
  const timeSinceLastAction = now - lastActivityTime

  // 1. Session reminder (working for too long)
  if (timeSinceStart > ONE_HOUR && !hasTriggeredSessionReminder) {
    hasTriggeredSessionReminder = true

    const sessionMessages = [
      `Wow, one full hour already! Don't forget to blink and hydrate! 💧`,
      `Time flies when you're coding! You've been at it for an hour. Maybe stretch those legs? 🏃‍♂️`,
      `Hey! 1 hour milestone reached! Let's take a quick break to rest those eyes. 👀`,
      `You're on fire! 🔥 But even machines need a cool-down. It's been an hour!`,
    ]
    const randomMsg = sessionMessages[Math.floor(Math.random() * sessionMessages.length)]

    return randomMsg
  }

  // 2. Idle reminder (stuck on something)
  if (timeSinceLastAction > FIFTEEN_MINS && !hasTriggeredIdleReminder) {
    hasTriggeredIdleReminder = true

    const idleMessages = [
      `Everything okay? I've been waiting for 15 minutes. Need help debugging? 🐛`,
      `Are we stuck, or just taking a well-deserved coffee break? ☕`,
      `If you're staring at a weird bug, maybe I can help you solve it! 🕵️`,
      `Still there? Sometimes a quick walk is all it takes to find the solution! 🚶‍♀️`,
    ]
    const randomMsg = idleMessages[Math.floor(Math.random() * idleMessages.length)]

    return randomMsg
  }

  return null
}
