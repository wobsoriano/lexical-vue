<script setup lang="ts">
import type {
  ElementFormatType, LexicalNode,
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
import { onMounted, onUnmounted, ref } from 'vue'
import { useLexicalNodeSelection } from '../composables/useLexicalNodeSelection'
import { useEditor } from '../composables/useEditor'
import { $isDecoratorBlockNode } from './LexicalDecoratorBlockNode'

const props = defineProps<{
  format?: ElementFormatType
  nodeKey: NodeKey
}>()

const editor = useEditor()
const { isSelected, setSelected, clearSelection }
    = useLexicalNodeSelection(props.nodeKey)
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

let unregisterListener: () => void

onMounted(() => {
  unregisterListener = mergeRegister(
    editor.registerCommand(
      FORMAT_ELEMENT_COMMAND,
      (payload) => {
        if (isSelected.value) {
          const selection = $getSelection()
          if ($isNodeSelection(selection)) {
            const node = $getNodeByKey(props.nodeKey) as LexicalNode | undefined
            if ($isDecoratorBlockNode(node))
              node?.setFormat(payload)
          }
          else if ($isRangeSelection(selection)) {
            const nodes = selection!.getNodes()
            for (const node of nodes) {
              if ($isDecoratorBlockNode(node)) {
                node.setFormat(payload)
              }
              else {
                const element = $getNearestBlockElementAncestorOrThrow(node)
                element.setFormat(payload)
              }
            }
          }
          return true
        }
        return false
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      CLICK_COMMAND,
      (event: MouseEvent) => {
        event.preventDefault()
        if (event.target === containerRef.value) {
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

onUnmounted(() => {
  unregisterListener?.()
})
</script>

<template>
  <div ref="containerRef" :style="`text-align: ${format}`" :class="`embed-block${isSelected ? ' focused' : ''}`">
    <slot />
  </div>
</template>
