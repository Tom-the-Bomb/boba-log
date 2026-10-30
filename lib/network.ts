import type { ApiErrorResponse } from "./types";

export function failureCode<T extends string>(fallback: T): T | "offline" {
  return navigator.onLine ? fallback : "offline";
}

export async function sendJson<T extends ApiErrorResponse = ApiErrorResponse>(
  url: string,
  method: string,
  body?: unknown,
) {
  const response = await fetch(url, {
    method,
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const { ok, status } = response;
  return { ok, status, data: (await response.json()) as T };
}
