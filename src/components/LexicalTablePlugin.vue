<script setup lang="ts">
import type { HTMLTableElementWithWithTableSelectionState, InsertTableCommandPayload, TableSelection } from '@lexical/table'
import {
  $createTableCellNode,
  $createTableNodeWithDimensions,
  $isTableNode,
  INSERT_TABLE_COMMAND,
  TableCellNode,
  TableNode,
  TableRowNode,
  applyTableHandlers,
} from '@lexical/table'
import type {
  DEPRECATED_GridCellNode,
  ElementNode,
  LexicalNode,
  NodeKey,
} from 'lexical'
import {
  $getNodeByKey,
  $isTextNode,
  $nodesOfType,
  COMMAND_PRIORITY_EDITOR,
  DEPRECATED_$computeGridMap,
  DEPRECATED_$getNodeTriplet,
  DEPRECATED_$isGridRowNode,
} from 'lexical'
import { $insertNodeToNearestRoot } from '@lexical/utils'
import { useEditor, useEffect, useMounted } from '../composables'

const props = withDefaults(defineProps<{
  hasCellMerge?: boolean
  hasCellBackgroundColor?: boolean
  hasTabHandler?: boolean
}>(), {
  hasCellMerge: true,
  hasCellBackgroundColor: true,
  hasTabHandler: true,
})

const editor = useEditor()

// TODO: extract to utils
function $insertFirst(parent: ElementNode, node: LexicalNode): void {
  const firstChild = parent.getFirstChild()
  if (firstChild !== null)
    firstChild.insertBefore(node)

  else
    parent.append(node)
}

useMounted(() => {
  if (!editor.hasNodes([TableNode, TableCellNode, TableRowNode])) {
    throw new Error(
      'TablePlugin: TableNode, TableCellNode or TableRowNode not registered on editor',
    )
  }

  return editor.registerCommand<InsertTableCommandPayload>(
    INSERT_TABLE_COMMAND,
    ({ columns, rows, includeHeaders }) => {
      const tableNode = $createTableNodeWithDimensions(
        Number(rows),
        Number(columns),
        includeHeaders,
      )
      $insertNodeToNearestRoot(tableNode)

      const firstDescendant = tableNode.getFirstDescendant()
      if ($isTextNode(firstDescendant))
        firstDescendant.select()

      return true
    },
    COMMAND_PRIORITY_EDITOR,
  )
})

useMounted(() => {
  const tableSelections = new Map<NodeKey, TableSelection>()

  const initializeTableNode = (tableNode: TableNode) => {
    const nodeKey = tableNode.getKey()
    const tableElement = editor.getElementByKey(
      nodeKey,
    ) as HTMLTableElementWithWithTableSelectionState
    if (tableElement && !tableSelections.has(nodeKey)) {
      const tableSelection = applyTableHandlers(
        tableNode,
        tableElement,
        editor,
        props.hasTabHandler,
      )
      tableSelections.set(nodeKey, tableSelection)
    }
  }

  // Plugins might be loaded _after_ initial content is set, hence existing table nodes
  // won't be initialized from mutation[create] listener. Instead doing it here,
  editor.getEditorState().read(() => {
    const tableNodes = $nodesOfType(TableNode)
    for (const tableNode of tableNodes) {
      if ($isTableNode(tableNode))
        initializeTableNode(tableNode)
    }
  })

  const unregisterMutationListener = editor.registerMutationListener(
    TableNode,
    (nodeMutations) => {
      for (const [nodeKey, mutation] of nodeMutations) {
        if (mutation === 'created') {
          editor.getEditorState().read(() => {
            const tableNode = $getNodeByKey<TableNode>(nodeKey)
            if ($isTableNode(tableNode))
              initializeTableNode(tableNode)
          })
        }
        else if (mutation === 'destroyed') {
          const tableSelection = tableSelections.get(nodeKey)

          if (tableSelection !== undefined) {
            tableSelection.removeListeners()
            tableSelections.delete(nodeKey)
          }
        }
      }
    },
  )

  return () => {
    unregisterMutationListener()
    // Hook might be called multiple times so cleaning up tables listeners as well,
    // as it'll be reinitialized during recurring call
    for (const [, tableSelection] of tableSelections)
      tableSelection.removeListeners()
  }
})

// Unmerge cells when the feature isn't enabled
useEffect(() => {
  if (props.hasCellMerge)
    return

  return editor.registerNodeTransform(TableCellNode, (node) => {
    if (node.getColSpan() > 1 || node.getRowSpan() > 1) {
      // When we have rowSpan we have to map the entire Table to understand where the new Cells
      // fit best; let's analyze all Cells at once to save us from further transform iterations
      const [, , gridNode] = DEPRECATED_$getNodeTriplet(node)
      const [gridMap] = DEPRECATED_$computeGridMap(gridNode, node, node)
      // TODO this function expects Tables to be normalized. Look into this once it exists
      const rowsCount = gridMap.length
      const columnsCount = gridMap[0].length
      let row = gridNode.getFirstChild()
      if (DEPRECATED_$isGridRowNode(row))
        throw new Error('Expected TableNode first child to be a RowNode')

      const unmerged = []
      for (let i = 0; i < rowsCount; i++) {
        if (i !== 0) {
          row = row!.getNextSibling()
          if (DEPRECATED_$isGridRowNode(row))
            throw new Error('Expected TableNode first child to be a RowNode')
        }
        let lastRowCell: null | DEPRECATED_GridCellNode = null
        for (let j = 0; j < columnsCount; j++) {
          const cellMap = gridMap[i][j]
          const cell = cellMap.cell
          if (cellMap.startRow === i && cellMap.startColumn === j) {
            lastRowCell = cell
            unmerged.push(cell)
          }
          else if (cell.getColSpan() > 1 || cell.getRowSpan() > 1) {
            const newCell = $createTableCellNode(cell.__headerState)
            if (lastRowCell !== null)
              lastRowCell.insertAfter(newCell)

            else
              $insertFirst(row as ElementNode, newCell)
          }
        }
      }
      for (const cell of unmerged) {
        cell.setColSpan(1)
        cell.setRowSpan(1)
      }
    }
  })
})

useEffect(() => {
  if (props.hasCellBackgroundColor)
    return

  return editor.registerNodeTransform(TableCellNode, (node) => {
    if (node.getBackgroundColor() !== null)
      node.setBackgroundColor(null)
  })
})
</script>

<template />
