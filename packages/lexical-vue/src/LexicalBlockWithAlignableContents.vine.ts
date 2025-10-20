import type {
  ElementFormatType,
  NodeKey,
} from 'lexical'
import {
  $getNearestBlockElementAncestorOrThrow,
  mergeRegister,
} from '@lexical/utils'
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
} from 'lexical'
import { useTemplateRef, watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'
import { $isDecoratorBlockNode } from './LexicalDecoratorBlockNode'
import { useLexicalNodeSelection } from './useLexicalNodeSelection'

export function LexicalBlockWithAlignableContents(props: {
  format?: ElementFormatType | null
  nodeKey: NodeKey
  baseClass?: string
  focusClass?: string
}) {
  const editor = useLexicalComposer()
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(() => props.nodeKey)
  const containerRef = useTemplateRef('containerRef')

  watchEffect((onInvalidate) => {
    const unregister = mergeRegister(
      editor.registerCommand<ElementFormatType>(
        FORMAT_ELEMENT_COMMAND,
        (formatType) => {
          if (isSelected) {
            const selection = $getSelection()

            if ($isNodeSelection(selection)) {
              const node = $getNodeByKey(props.nodeKey)

              if (node && $isDecoratorBlockNode(node))
                node.setFormat(formatType)
            }
            else if ($isRangeSelection(selection)) {
              const nodes = selection.getNodes()

              for (const node of nodes) {
                if ($isDecoratorBlockNode(node)) {
                  node.setFormat(formatType)
                }
                else {
                  const element = $getNearestBlockElementAncestorOrThrow(node)
                  element.setFormat(formatType)
                }
              }
            }

            return true
          }
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        (event) => {
          if (event.target === containerRef.value) {
            event.preventDefault()
            if (!event.shiftKey)
              clearSelection()

            setSelected(!isSelected.value)
            return true
          }
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
    )

    onInvalidate(unregister)
  })

  vineSlots<{
    default: () => any
  }>()

  return vine`
    <div
      ref="containerRef"
      :class="[baseClass, isSelected ? focusClass : '']"
      :style="{ textAlign: format as any }"
    >
      <slot />
    </div>
  `
}
