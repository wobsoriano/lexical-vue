import { registerCheckList } from '@lexical/list'
import { defineComponent, watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'

export const CheckListPlugin = defineComponent(
  (props: { disableTakeFocusOnClick?: boolean }) => {
    const editor = useLexicalComposer()

    watchEffect((onInvalidate) => {
      const unregister = registerCheckList(editor, {
        disableTakeFocusOnClick: props.disableTakeFocusOnClick ?? false,
      })

      onInvalidate(unregister)
    })

    return () => null
  },
  { name: 'CheckListPlugin', props: ['disableTakeFocusOnClick'] },
)
