import { onMounted, onUnmounted } from 'vue'

/**
 * @internal
 */
export function useMounted(cb: () => undefined | (() => any)) {
  let unregister: (() => void) | undefined

  onMounted(() => {
    unregister = cb()
  })

  onUnmounted(() => {
    unregister?.()
  })
}
