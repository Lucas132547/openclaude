export const LEVEL_BRACKETS = [
  { level: 1, minXp: 0, hat: undefined, status: "Buddy is learning the workflow." },
  { level: 2, minXp: 3, hat: "leaf", status: "Buddy is enjoying the progress!" },
  { level: 3, minXp: 10, hat: "hardhat", status: "Buddy is hard at work!" },
  { level: 4, minXp: 20, hat: "chef", status: "Buddy is cooking up code!" },
  { level: 5, minXp: 35, hat: "wizard", status: "Buddy has mastered the arts!" },
  { level: 6, minXp: 50, hat: "crown", status: "Buddy is legendary!" }
] as const;

export function getLevelInfo(xp: number = 0) {
  let currentBracket = LEVEL_BRACKETS[0];
  for (const bracket of LEVEL_BRACKETS) {
    if (xp >= bracket.minXp) {
      currentBracket = bracket;
    } else {
      break;
    }
  }
  return currentBracket;
}
