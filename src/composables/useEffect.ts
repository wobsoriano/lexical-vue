import type { WatchOptionsBase } from 'vue'
import { watchEffect } from 'vue'

/**
 * @internal
 */
export function useEffect(cb: () => (() => any) | undefined, options?: WatchOptionsBase) {
  watchEffect((onInvalidate) => {
    const unregister = cb()

    onInvalidate(() => unregister?.())
  }, {
    flush: 'post',
    ...options,
  })
}
