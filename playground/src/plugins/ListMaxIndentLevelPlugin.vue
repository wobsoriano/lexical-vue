<script setup lang="ts">
import type { ListNode } from '@lexical/list'
import { $getListDepth, $isListItemNode, $isListNode } from '@lexical/list'
import type { RangeSelection } from 'lexical'
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  INDENT_CONTENT_COMMAND,
} from 'lexical'
import { useLexicalComposer } from 'lexical-vue'
import { onMounted, onUnmounted } from 'vue'
import invariant from 'tiny-invariant'

const props = withDefaults(defineProps<{
  maxDepth?: number
}>(), {
  maxDepth: 7,
})

function getElementNodesInSelection(selection: RangeSelection) {
  const nodesInSelection = selection.getNodes()

  if (nodesInSelection.length === 0) {
    return new Set([
      selection.anchor.getNode().getParentOrThrow(),
      selection.focus.getNode().getParentOrThrow(),
    ])
  }

  return new Set(
    nodesInSelection.map(n => ($isElementNode(n) ? n : n.getParentOrThrow())),
  )
}

const highPriority = 3

function isIndentPermitted(maxDepth: number) {
  const selection = $getSelection() as RangeSelection

  if (!$isRangeSelection(selection))
    return false

  const elementNodesInSelection = getElementNodesInSelection(selection)

  let totalDepth = 0

  for (const elementNode of elementNodesInSelection) {
    if ($isListNode(elementNode)) {
      totalDepth = Math.max($getListDepth(elementNode as ListNode) + 1, totalDepth)
    }
    else if ($isListItemNode(elementNode)) {
      const parent = elementNode.getParent() as ListNode
      if (!$isListNode(parent as ListNode))
        invariant(false, 'ListMaxIndentLevelPlugin: A ListItemNode must have a ListNode for a parent.')

      totalDepth = Math.max($getListDepth(parent) + 1, totalDepth)
    }
  }

  return totalDepth <= maxDepth
}

const editor = useLexicalComposer()
let unregisterListener: () => void

onMounted(() => {
  unregisterListener = editor.registerCommand(
    INDENT_CONTENT_COMMAND,
    () => !isIndentPermitted(props.maxDepth ?? 7),
    highPriority,
  )
})

onUnmounted(() => {
  unregisterListener?.()
})
</script>

<template />
