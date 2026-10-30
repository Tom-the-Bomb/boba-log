export function failureCode<T extends string>(fallback: T): T | "offline" {
  return typeof navigator !== "undefined" && navigator.onLine === false
    ? "offline"
    : fallback;
}
