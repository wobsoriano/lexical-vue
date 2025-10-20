import { registerTabIndentation } from '@lexical/extension'
import { watchEffect } from 'vue'
import { useLexicalComposer } from './composables'

export function LexicalTabIndentationPlugin(props: {
  maxIndent?: number
}) {
  const editor = useLexicalComposer()

  watchEffect((onInvalidate) => {
    const unregister = registerTabIndentation(editor, props.maxIndent)

    onInvalidate(unregister)
  })

  return vine``
}
