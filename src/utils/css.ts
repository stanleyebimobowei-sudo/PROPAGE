export function toCssDuration(seconds: number): string {
  return `${Math.max(seconds, 0)}s`
}
