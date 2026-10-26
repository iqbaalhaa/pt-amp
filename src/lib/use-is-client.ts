import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// true setelah hydrate di browser, false saat SSR — pengganti pola useEffect(() => setMounted(true)).
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
