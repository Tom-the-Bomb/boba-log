/**
 * The error code to show when a request fails outright: "offline" when the
 * browser knows it has no connection, otherwise the given fallback.
 */
export function failureCode(fallback: string): string {
  return typeof navigator !== "undefined" && navigator.onLine === false
    ? "offline"
    : fallback;
}
