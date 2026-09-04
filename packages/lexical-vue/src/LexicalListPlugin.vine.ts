import { ListItemNode, ListNode, registerListStrictIndentTransform } from '@lexical/list'
import { watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'
import { useList } from './shared/useList'

export interface ListPluginProps {
  /**
   * When `true`, enforces strict indentation rules for list items, ensuring consistent structure.
   * When `false` (default), indentation is more flexible.
   */
  hasStrictIndent?: boolean
  /**
   * When `true`, splitting a numbered list will preserve the numbering continuity.
   * When `false` (default), the new split list resets to 1.
   */
  shouldPreserveNumbering?: boolean
}

export function ListPlugin(props: ListPluginProps) {
  const editor = useLexicalComposer()
  watchEffect((onInvalidate) => {
    if (!editor.hasNodes([ListNode, ListItemNode])) {
      throw new Error('ListPlugin: ListNode and/or ListItemNode not registered on editor')
    }

    if (!props.hasStrictIndent) {
      return
    }

    const unregister = registerListStrictIndentTransform(editor)

    onInvalidate(unregister)
  })

  useList(editor, () => props.shouldPreserveNumbering)

  return vine``
}
