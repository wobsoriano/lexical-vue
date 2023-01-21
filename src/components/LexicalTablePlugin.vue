<script setup lang="ts">
import type { HTMLTableElementWithWithTableSelectionState, InsertTableCommandPayload, TableSelection } from '@lexical/table'
import {
  $createTableNodeWithDimensions,
  INSERT_TABLE_COMMAND,
  TableCellNode,
  TableNode,
  TableRowNode,
  applyTableHandlers,
} from '@lexical/table'
import type { ElementNode, NodeKey } from 'lexical'
import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isRootNode,
  COMMAND_PRIORITY_EDITOR,
} from 'lexical'
import { useEditor, useMounted } from '../composables'

const editor = useEditor()

if (!editor.hasNodes([TableNode, TableCellNode, TableRowNode])) {
  throw new Error(
    'TablePlugin: TableNode, TableCellNode or TableRowNode not registered on editor',
  )
}

useMounted(() => {
  return editor.registerCommand<InsertTableCommandPayload>(
    INSERT_TABLE_COMMAND,
    ({ columns, rows, includeHeaders }) => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection))
        return true

      const focus = selection.focus
      const focusNode = focus.getNode()

      if (focusNode !== null) {
        const tableNode = $createTableNodeWithDimensions(
          Number(rows),
          Number(columns),
          includeHeaders,
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

useMounted(() => {
  const tableSelections = new Map<NodeKey, TableSelection>()

  return editor.registerMutationListener(TableNode, (nodeMutations) => {
    for (const [nodeKey, mutation] of nodeMutations) {
      if (mutation === 'created') {
        editor.update(() => {
          const tableElement = editor.getElementByKey(nodeKey) as HTMLTableElementWithWithTableSelectionState
          const tableNode = $getNodeByKey<TableNode>(nodeKey)

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
</script>

<template />
