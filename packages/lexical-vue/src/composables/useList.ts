import type { LexicalEditor } from 'lexical'

import {
  $handleListInsertParagraph,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  indentList,
  insertList,
  outdentList,
  removeList,
} from '@lexical/list'
import { mergeRegister } from '@lexical/utils'
import {
  COMMAND_PRIORITY_LOW,
  INDENT_CONTENT_COMMAND,
  INSERT_PARAGRAPH_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from 'lexical'
import { onMounted, onUnmounted } from 'vue'

export function useList(editor: LexicalEditor): void {
  let unregisterListener: () => void

  onMounted(() => {
    unregisterListener = mergeRegister(
      editor.registerCommand(
        INDENT_CONTENT_COMMAND,
        () => {
          indentList()
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        OUTDENT_CONTENT_COMMAND,
        () => {
          outdentList()
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        INSERT_ORDERED_LIST_COMMAND,
        () => {
          insertList(editor, 'ol')
          return true
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        INSERT_UNORDERED_LIST_COMMAND,
        () => {
          insertList(editor, 'ul')
          return true
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        REMOVE_LIST_COMMAND,
        () => {
          removeList(editor)
          return true
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        INSERT_PARAGRAPH_COMMAND,
        () => {
          const hasHandledInsertParagraph = $handleListInsertParagraph()
          if (hasHandledInsertParagraph)
            return true

          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  })

  onUnmounted(() => {
    unregisterListener?.()
  })
}
