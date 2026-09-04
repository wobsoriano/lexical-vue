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
import { defineComponent, onMounted, onUnmounted, watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer'

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

export const TablePlugin = defineComponent(
  (props: TablePluginProps) => {
    const editor = useLexicalComposer()
    const hasNestedTablesSignal = signal(props.hasNestedTables!)

    watchEffect(() => {
      hasNestedTablesSignal.value = props.hasNestedTables!
    })

    watchEffect(() => {
      const hadHorizontalScroll = $isScrollableTablesActive(editor)
      if (hadHorizontalScroll !== props.hasHorizontalScroll) {
        setScrollableTablesActive(editor, props.hasHorizontalScroll!)
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
      const unregister = registerTableSelectionObserver(editor, props.hasTabHandler)

      onInvalidate(unregister)
    })

    watchEffect((onInvalidate) => {
      if (!props.hasCellMerge) {
        const unregister = registerTableCellUnmergeTransform(editor)

        onInvalidate(unregister)
      }
    })

    watchEffect((onInvalidate) => {
      if (!props.hasCellBackgroundColor) {
        const unregister = editor.registerNodeTransform(TableCellNode, (node) => {
          if (node.getBackgroundColor() !== null) node.setBackgroundColor(null)
        })

        onInvalidate(unregister)
      }
    })

    return () => null
  },
  {
    name: 'TablePlugin',
    props: {
      hasCellMerge: { type: Boolean, default: true },
      hasCellBackgroundColor: { type: Boolean, default: true },
      hasTabHandler: { type: Boolean, default: true },
      hasHorizontalScroll: { type: Boolean, default: false },
      hasNestedTables: { type: Boolean, default: false },
    },
  },
)
