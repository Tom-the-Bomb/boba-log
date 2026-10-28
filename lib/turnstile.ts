import type { TurnstileInstance } from "@marsidev/react-turnstile";
import type { RefObject } from "react";

export function waitForToken(
  ref: RefObject<TurnstileInstance | null>,
  timeout = 10000,
): Promise<string> {
  const existing = ref.current?.getResponse();
  if (existing) {
    return Promise.resolve(existing);
  }
  return new Promise((resolve) => {
    const start = Date.now();
    const id = setInterval(() => {
      const token = ref.current?.getResponse();
      if (token || Date.now() - start >= timeout) {
        clearInterval(id);
        resolve(token ?? "");
      }
    }, 100);
  });
}
