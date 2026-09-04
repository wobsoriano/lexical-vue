import { registerCheckList } from '@lexical/list'
import { watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'

export function CheckListPlugin(props: { disableTakeFocusOnClick?: boolean }) {
  const editor = useLexicalComposer()

  watchEffect((onInvalidate) => {
    const unregister = registerCheckList(editor, {
      disableTakeFocusOnClick: props.disableTakeFocusOnClick ?? false,
    })

    onInvalidate(unregister)
  })

  return vine``
}
