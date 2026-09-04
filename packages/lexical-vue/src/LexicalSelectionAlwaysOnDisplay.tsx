import { selectionAlwaysOnDisplay } from '@lexical/utils'
import { defineComponent, watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer'
import { useHasListener } from './shared/useHasListener'

export const SelectionAlwaysOnDisplay = defineComponent(
  (_props: object, ctx: { emit: (event: 'reposition', nodes: readonly HTMLElement[]) => void }) => {
    const editor = useLexicalComposer()

    const hasRepositionListener = useHasListener('Reposition')

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
