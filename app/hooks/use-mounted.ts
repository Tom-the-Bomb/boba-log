import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export default function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
