<script setup lang="ts">
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
  $isDecoratorNode,
  $isNodeSelection,
  $isRangeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
} from 'lexical'
import { ref } from 'vue'
import { useLexicalComposer, useLexicalNodeSelection } from '../composables'
import { useMounted } from '../composables/useMounted'
import { $isDecoratorBlockNode } from './LexicalDecoratorBlockNode'

const props = defineProps<{
  format?: ElementFormatType
  nodeKey: NodeKey
  baseClass?: string
  focusClass?: string
}>()

const editor = useLexicalComposer()
const { isSelected, setSelected, clearSelection } = useLexicalNodeSelection(props.nodeKey)
const containerRef = ref<HTMLDivElement | null>(null)

function $onDelete(event: KeyboardEvent) {
  const deleteSelection = $getSelection()
  if (isSelected.value && $isNodeSelection(deleteSelection)) {
    event.preventDefault()
    deleteSelection.getNodes().forEach((node) => {
      if ($isDecoratorNode(node)) {
        node.remove()
      }
    })
  }
  return false
}

useMounted(() => {
  return mergeRegister(
    editor.registerCommand<ElementFormatType>(
      FORMAT_ELEMENT_COMMAND,
      (formatType) => {
        if (isSelected.value) {
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
    editor.registerCommand(
      KEY_DELETE_COMMAND,
      $onDelete,
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      $onDelete,
      COMMAND_PRIORITY_LOW,
    ),
  )
})
</script>

<template>
  <div
    ref="containerRef"
    :style="`text-align: ${format}`"
    :class="[baseClass, isSelected ? focusClass : '']"
  >
    <slot />
  </div>
</template>
