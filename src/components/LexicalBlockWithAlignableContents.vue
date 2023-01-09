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
import { useEditor, useLexicalNodeSelection } from '../composables'
import { useMounted } from '../composables/useMounted'
import { $isDecoratorBlockNode } from './LexicalDecoratorBlockNode'

const props = defineProps<{
  format?: ElementFormatType
  nodeKey: NodeKey
}>()

const editor = useEditor()
const { isSelected, setSelected, clearSelection } = useLexicalNodeSelection(props.nodeKey)
const containerRef = ref<HTMLDivElement | null>(null)

const onDelete = (event: KeyboardEvent) => {
  if (isSelected.value && $isNodeSelection($getSelection())) {
    event.preventDefault()
    editor.update(() => {
      const node = $getNodeByKey(props.nodeKey)
      if ($isDecoratorNode(node) && node.isTopLevel())
        node?.remove()

      setSelected(false)
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
      onDelete,
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      onDelete,
      COMMAND_PRIORITY_LOW,
    ),
  )
})
</script>

<template>
  <div ref="containerRef" :style="`text-align: ${format}`" :class="`embed-block${isSelected ? ' focused' : ''}`">
    <slot />
  </div>
</template>
