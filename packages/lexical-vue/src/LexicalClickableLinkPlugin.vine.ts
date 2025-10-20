import { namedSignals } from '@lexical/extension'
import { registerClickableLink } from '@lexical/link'
import { watchEffect } from 'vue'
import { useLexicalComposer } from './composables'

export function LexicalClickableLinkPlugin() {
  const editor = useLexicalComposer()

  const newTab = vineProp.withDefault(true)
  const disabled = vineProp.withDefault(false)

  watchEffect((onInvalidate) => {
    const unregister = registerClickableLink(editor, namedSignals({ disabled: disabled.value, newTab: newTab.value }))

    onInvalidate(unregister)
  })

  return vine``
}
