import { onMounted, onUnmounted } from 'vue'

export function useMounted(cb: () => () => any) {
  let unregister: () => void

  onMounted(() => {
    unregister = cb()
  })

  onUnmounted(() => {
    unregister?.()
  })
}
