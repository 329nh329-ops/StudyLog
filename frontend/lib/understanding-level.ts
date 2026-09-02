export function understandingLevelStars(level: number): string {
  return "★".repeat(level) + "☆".repeat(5 - level);
}
