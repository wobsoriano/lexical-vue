import {
  $isScrollableTablesActive,
  registerTableCellUnmergeTransform,
  registerTablePlugin,
  registerTableSelectionObserver,
  setScrollableTablesActive,
  TableCellNode,
  TableNode,
} from '@lexical/table'

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
}

export function TablePlugin({
  hasCellMerge = true,
  hasCellBackgroundColor = true,
  hasTabHandler = true,
  hasHorizontalScroll = false,
}: TablePluginProps) {
  const editor = useLexicalComposer()

  watchEffect(() => {
    const hadHorizontalScroll = $isScrollableTablesActive(editor)
    if (hadHorizontalScroll !== hasHorizontalScroll) {
      setScrollableTablesActive(editor, hasHorizontalScroll)
      // Registering the transform has the side-effect of marking all existing
      // TableNodes as dirty. The handler is immediately unregistered.
      editor.registerNodeTransform(TableNode, () => {})()
    }
  })

  onMounted(() => {
    const unregister = registerTablePlugin(editor)

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
        if (node.getBackgroundColor() !== null)
          node.setBackgroundColor(null)
      })

      onInvalidate(unregister)
    }
  })

  return vine``
}
