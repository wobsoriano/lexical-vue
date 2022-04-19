<script setup lang="ts">
import type { Grid, TableSelection } from '@lexical/table'
import {
  $createTableNodeWithDimensions,
  INSERT_TABLE_COMMAND,
  TableCellNode,
  TableNode,
  TableRowNode,
  applyTableHandlers,
} from '@lexical/table'
import type { ElementNode, GridSelection, NodeKey, RangeSelection } from 'lexical'
import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isRootNode,
  COMMAND_PRIORITY_EDITOR,
} from 'lexical'
import { onMounted, onUnmounted } from 'vue'
import { useEditor } from '../composables/useEditor'

const editor = useEditor()

let unregisterListener: () => void
let unregisterMutationListener: () => void

if (!editor.hasNodes([TableNode, TableCellNode, TableRowNode])) {
  throw new Error(
    'TablePlugin: TableNode, TableCellNode or TableRowNode not registered on editor',
  )
}

onMounted(() => {
  unregisterListener = editor.registerCommand(
    INSERT_TABLE_COMMAND,
    (payload: Grid) => {
      const { columns, rows } = payload
      const selection = $getSelection() as RangeSelection | GridSelection
      if (!$isRangeSelection(selection))
        return true

      const focus = selection.focus
      const focusNode = focus.getNode() as ElementNode

      if (focusNode !== null) {
        const tableNode = $createTableNodeWithDimensions(
          Number(rows),
          Number(columns),
        )
        if ($isRootNode(focusNode)) {
          const target = focusNode.getChildAtIndex(focus.offset)
          if (target !== null)
            target.insertBefore(tableNode)

          else
            focusNode.append(tableNode)

          tableNode.insertBefore($createParagraphNode())
        }
        else {
          const topLevelNode = focusNode.getTopLevelElementOrThrow()
          topLevelNode.insertAfter(tableNode)
        }
        tableNode.insertAfter($createParagraphNode())
        const firstCell = tableNode
          .getFirstChildOrThrow<ElementNode>()
          .getFirstChildOrThrow<ElementNode>()
        firstCell.select()
      }
      return true
    },
    COMMAND_PRIORITY_EDITOR,
  )
})

onMounted(() => {
  const tableSelections = new Map<NodeKey, TableSelection>()

  unregisterMutationListener = editor.registerMutationListener(TableNode, (nodeMutations) => {
    for (const [nodeKey, mutation] of nodeMutations) {
      if (mutation === 'created') {
        editor.update(() => {
          const tableElement = editor.getElementByKey(nodeKey)
          const tableNode = $getNodeByKey(nodeKey) as TableNode | null

          if (tableElement && tableNode) {
            const tableSelection = applyTableHandlers(
              tableNode,
              tableElement,
              editor,
            )

            tableSelections.set(nodeKey, tableSelection)
          }
        })
      }
      else if (mutation === 'destroyed') {
        const tableSelection = tableSelections.get(nodeKey)
        if (tableSelection) {
          tableSelection.removeListeners()
          tableSelections.delete(nodeKey)
        }
      }
    }
  })
})

onUnmounted(() => {
  unregisterListener?.()
  unregisterMutationListener?.()
})
</script>

<template />
