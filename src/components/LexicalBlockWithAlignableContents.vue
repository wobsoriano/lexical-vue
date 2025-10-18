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
  $isNodeSelection,
  $isRangeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
} from 'lexical'
import { useTemplateRef } from 'vue'
import { useLexicalComposer, useLexicalNodeSelection } from '../composables'
import { useMounted } from '../composables/useMounted'
import { $isDecoratorBlockNode } from './LexicalDecoratorBlockNode'

const props = defineProps<{
  format?: ElementFormatType | null
  nodeKey: NodeKey
  baseClass?: string
  focusClass?: string
}>()

const editor = useLexicalComposer()
const { isSelected, setSelected, clearSelection } = useLexicalNodeSelection(() => props.nodeKey)
const containerRef = useTemplateRef('containerRef')

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
