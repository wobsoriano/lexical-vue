import { registerTabIndentation } from '@lexical/extension'
import { watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'

/**
 * This plugin adds the ability to indent content using the tab key. Generally, we don't
 * recommend using this plugin as it could negatively affect accessibility for keyboard
 * users, causing focus to become trapped within the editor.
 */
export function TabIndentationPlugin(props: {
  maxIndent?: number
}) {
  const editor = useLexicalComposer()

  watchEffect((onInvalidate) => {
    const unregister = registerTabIndentation(editor, props.maxIndent)

    onInvalidate(unregister)
  })

  return vine``
}
