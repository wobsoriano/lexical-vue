import { selectionAlwaysOnDisplay } from '@lexical/utils'
import { defineComponent, getCurrentInstance, onUpdated, ref, watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer'

export const SelectionAlwaysOnDisplay = defineComponent(
  (_props: object, ctx: { emit: (event: 'reposition', nodes: readonly HTMLElement[]) => void }) => {
    const instance = getCurrentInstance()
    const editor = useLexicalComposer()

    function hasRepositionListenerProp() {
      const vnodeProps = instance?.vnode.props
      return (
        vnodeProps != null && ('onReposition' in vnodeProps || 'onRepositionOnce' in vnodeProps)
      )
    }

    const hasRepositionListener = ref(hasRepositionListenerProp())

    onUpdated(() => {
      hasRepositionListener.value = hasRepositionListenerProp()
    })

    watchEffect((onInvalidate) => {
      const unregister = selectionAlwaysOnDisplay(
        editor,
        hasRepositionListener.value ? (nodes) => ctx.emit('reposition', nodes) : undefined,
      )
      onInvalidate(unregister)
    })

    return () => null
  },
  {
    name: 'SelectionAlwaysOnDisplay',
    emits: { reposition: (_nodes: readonly HTMLElement[]) => true },
  },
)
