import { selectionAlwaysOnDisplay } from '@lexical/utils'
import { getCurrentInstance, onUpdated, ref, watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'

export function SelectionAlwaysOnDisplay() {
  const instance = getCurrentInstance()
  const editor = useLexicalComposer()
  const emit = vineEmits<{
    reposition?: [nodes: readonly HTMLElement[]]
  }>()

  function hasRepositionListenerProp() {
    const vnodeProps = instance?.vnode.props
    return vnodeProps != null && ('onReposition' in vnodeProps || 'onRepositionOnce' in vnodeProps)
  }

  const hasRepositionListener = ref(hasRepositionListenerProp())

  onUpdated(() => {
    hasRepositionListener.value = hasRepositionListenerProp()
  })

  watchEffect((onInvalidate) => {
    const unregister = selectionAlwaysOnDisplay(
      editor,
      hasRepositionListener.value ? (nodes) => emit('reposition', nodes) : undefined,
    )
    onInvalidate(unregister)
  })
  return vine``
}
