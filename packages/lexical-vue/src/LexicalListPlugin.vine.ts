import { ListItemNode, ListNode, registerListStrictIndentTransform } from '@lexical/list'
import { watchEffect } from 'vue'
import { useLexicalComposer } from './composables'
import { useList } from './composables/useList'

export function LexicalListPlugin(props: {
  /**
   * When `true`, enforces strict indentation rules for list items, ensuring consistent structure.
   * When `false` (default), indentation is more flexible.
   */
  hasStrictIndent?: boolean
}) {
  const editor = useLexicalComposer()
  watchEffect((onInvalidate) => {
    if (!editor.hasNodes([ListNode, ListItemNode])) {
      throw new Error(
        'ListPlugin: ListNode and/or ListItemNode not registered on editor',
      )
    }

    if (!props.hasStrictIndent) {
      return
    }

    const unregister = registerListStrictIndentTransform(editor)

    onInvalidate(unregister)
  })

  useList(editor)

  return vine``
}
