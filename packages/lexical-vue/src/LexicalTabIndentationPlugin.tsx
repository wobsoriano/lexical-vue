import type { CanIndentPredicate } from '@lexical/extension'
import { registerTabIndentation } from '@lexical/extension'
import { defineComponent, watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'

/**
 * This plugin adds the ability to indent content using the tab key. Generally, we don't
 * recommend using this plugin as it could negatively affect accessibility for keyboard
 * users, causing focus to become trapped within the editor.
 */
export const TabIndentationPlugin = defineComponent(
  (props: { maxIndent?: number; canIndent?: CanIndentPredicate }) => {
    const editor = useLexicalComposer()

    watchEffect((onInvalidate) => {
      const unregister = registerTabIndentation(editor, props.maxIndent, props.canIndent)

      onInvalidate(unregister)
    })

    return () => null
  },
  { name: 'TabIndentationPlugin', props: ['maxIndent', 'canIndent'] },
)
