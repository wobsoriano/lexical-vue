import type { WatchOptionsBase } from 'vue'
import { watchEffect } from 'vue'

/**
 * @internal
 */
export function useEffect(cb: () => ((() => any) | void), options?: WatchOptionsBase) {
  watchEffect((onInvalidate) => {
    const unregister = cb()

    onInvalidate(() => unregister?.())
  }, {
    ...options,
  })
}
