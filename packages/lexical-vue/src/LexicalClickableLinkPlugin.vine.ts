import { namedSignals } from '@lexical/extension'
import { registerClickableLink } from '@lexical/link'
import { watchEffect } from 'vue'
import { useLexicalComposer } from './composables'

export function LexicalClickableLinkPlugin({
  newTab = true,
  disabled = false,
}: {
  newTab: boolean
  disabled: boolean
}) {
  const editor = useLexicalComposer()

  watchEffect((onInvalidate) => {
    const unregister = registerClickableLink(editor, namedSignals({ disabled, newTab }))

    onInvalidate(unregister)
  })

  return vine``
}
