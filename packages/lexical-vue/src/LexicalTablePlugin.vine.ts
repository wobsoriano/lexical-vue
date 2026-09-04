import { signal } from '@lexical/extension'
import {
  $isScrollableTablesActive,
  registerTableCellUnmergeTransform,
  registerTablePlugin,
  registerTableSelectionObserver,
  setScrollableTablesActive,
  TableCellNode,
} from '@lexical/table'

import { $fullReconcile } from 'lexical'
import { onMounted, onUnmounted, watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'

export interface TablePluginProps {
  /**
   * When `false` (default `true`), merged cell support (colspan and rowspan) will be disabled and all
   * tables will be forced into a regular grid with 1x1 table cells.
   */
  hasCellMerge?: boolean
  /**
   * When `false` (default `true`), the background color of TableCellNode will always be removed.
   */
  hasCellBackgroundColor?: boolean
  /**
   * When `true` (default `true`), the tab key can be used to navigate table cells.
   */
  hasTabHandler?: boolean
  /**
   * When `true` (default `false`), tables will be wrapped in a `<div>` to enable horizontal scrolling
   */
  hasHorizontalScroll?: boolean
  /**
   * When `true` (default `false`), nested tables will be allowed.
   *
   * @experimental Nested tables are not officially supported.
   */
  hasNestedTables?: boolean
}

export function TablePlugin({
  hasCellMerge = true,
  hasCellBackgroundColor = true,
  hasTabHandler = true,
  hasHorizontalScroll = false,
  hasNestedTables = false,
}: TablePluginProps) {
  const editor = useLexicalComposer()
  const hasNestedTablesSignal = signal(hasNestedTables)

  watchEffect(() => {
    hasNestedTablesSignal.value = hasNestedTables
  })

  watchEffect(() => {
    const hadHorizontalScroll = $isScrollableTablesActive(editor)
    if (hadHorizontalScroll !== hasHorizontalScroll) {
      setScrollableTablesActive(editor, hasHorizontalScroll)
      editor.update($fullReconcile)
    }
  })

  onMounted(() => {
    const unregister = registerTablePlugin(editor, {
      hasNestedTables: hasNestedTablesSignal,
    })

    onUnmounted(unregister)
  })

  watchEffect((onInvalidate) => {
    const unregister = registerTableSelectionObserver(editor, hasTabHandler)

    onInvalidate(unregister)
  })

  // Unmerge cells when the feature isn't enabled
  watchEffect((onInvalidate) => {
    if (!hasCellMerge) {
      const unregister = registerTableCellUnmergeTransform(editor)

      onInvalidate(unregister)
    }
  })

  // Remove cell background color when feature is disabled
  watchEffect((onInvalidate) => {
    if (!hasCellBackgroundColor) {
      const unregister = editor.registerNodeTransform(TableCellNode, (node) => {
        if (node.getBackgroundColor() !== null) node.setBackgroundColor(null)
      })

      onInvalidate(unregister)
    }
  })

  return vine``
}
