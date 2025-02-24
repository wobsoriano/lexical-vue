<script setup lang="ts">
import type {
  LexicalCommand,
  LexicalEditor,
  RangeSelection,
} from 'lexical'
import {
  $createRangeSelection,
  $getSelection,
  $isBlockElementNode,
  $isRangeSelection,
  $normalizeSelection__EXPERIMENTAL,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_EDITOR,
  INDENT_CONTENT_COMMAND,
  INSERT_TAB_COMMAND,
  KEY_TAB_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from 'lexical'
import { $filter, $getNearestBlockElementAncestorOrThrow, mergeRegister } from '@lexical/utils'
import { useLexicalComposer } from '../composables'
import { useMounted } from '../composables/useMounted'

const props = defineProps<{
  maxIndent?: number
}>()

const editor = useLexicalComposer()

function $indentOverTab(selection: RangeSelection): boolean {
  const nodes = selection.getNodes()
  const canIndentBlockNodes = $filter(nodes, (node) => {
    if ($isBlockElementNode(node) && node.canIndent())
      return node
    return null
  })

  // 1. If selection spans across canIndent block nodes: indent
  if (canIndentBlockNodes.length > 0)
    return true

  // 2. If first (anchor/focus) is at block start: indent
  const anchor = selection.anchor
  const focus = selection.focus
  const first = focus.isBefore(anchor) ? focus : anchor
  const firstNode = first.getNode()
  const firstBlock = $getNearestBlockElementAncestorOrThrow(firstNode)

  if (firstBlock.canIndent()) {
    const firstBlockKey = firstBlock.getKey()
    let selectionAtStart = $createRangeSelection()
    selectionAtStart.anchor.set(firstBlockKey, 0, 'element')
    selectionAtStart.focus.set(firstBlockKey, 0, 'element')
    selectionAtStart = $normalizeSelection__EXPERIMENTAL(selectionAtStart)
    if (selectionAtStart.anchor.is(first))
      return true
  }

  // 3. Else: tab
  return false
}

function registerTabIndentation(
  editor: LexicalEditor,
  maxIndent?: number,
) {
  return mergeRegister(
    editor.registerCommand<KeyboardEvent>(
      KEY_TAB_COMMAND,
      (event) => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          return false
        }
        event.preventDefault()
        const command: LexicalCommand<void> = $indentOverTab(selection)
          ? event.shiftKey
            ? OUTDENT_CONTENT_COMMAND
            : INDENT_CONTENT_COMMAND
          : INSERT_TAB_COMMAND
        return editor.dispatchCommand(command, undefined)
      },
      COMMAND_PRIORITY_EDITOR,
    ),

    editor.registerCommand(
      INDENT_CONTENT_COMMAND,
      () => {
        if (maxIndent == null) {
          return false
        }

        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          return false
        }

        const indents = selection
          .getNodes()
          .map(node =>
            $getNearestBlockElementAncestorOrThrow(node).getIndent(),
          )

        return Math.max(...indents) + 1 >= maxIndent
      },
      COMMAND_PRIORITY_CRITICAL,
    ),
  )
}

useMounted(() => {
  return registerTabIndentation(editor, props.maxIndent)
})
</script>

<template />
