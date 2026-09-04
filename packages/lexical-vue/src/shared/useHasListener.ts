import { getCurrentInstance, onUpdated, ref } from 'vue'

/**
 * Whether the parent passed a listener for `event`, so a component can skip
 * work nobody is watching. Vue has no reactive equivalent, and resolved props
 * cannot answer it, so this reads the raw vnode props and refreshes on update.
 */
export function useHasListener(event: string) {
  const instance = getCurrentInstance()
  const names = [`on${event}`, `on${event}Once`]

  function read() {
    const vnodeProps = instance?.vnode.props
    return vnodeProps != null && names.some((name) => name in vnodeProps)
  }

  const hasListener = ref(read())

  onUpdated(() => {
    hasListener.value = read()
  })

  return hasListener
}
