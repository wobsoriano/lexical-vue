import { $createHorizontalRuleNode, INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/extension'
import { $insertNodeToNearestRoot } from '@lexical/utils'
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
} from 'lexical'
import { onMounted, onUnmounted } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'

export function LexicalHorizontalRulePlugin() {
  const editor = useLexicalComposer()

  onMounted(() => {
    const unregister = editor.registerCommand(
      INSERT_HORIZONTAL_RULE_COMMAND,
      () => {
        const selection = $getSelection()

        if (!$isRangeSelection(selection)) {
          return false
        }

        const focusNode = selection.focus.getNode()

        if (focusNode !== null) {
          const horizontalRuleNode = $createHorizontalRuleNode()
          $insertNodeToNearestRoot(horizontalRuleNode)
        }

        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )

    onUnmounted(unregister)
  })

  return vine``
}
