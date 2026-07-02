import { useSyncExternalStore } from 'react';

/** True after client hydration; false during SSR. Avoids setState-in-effect mount guards. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}