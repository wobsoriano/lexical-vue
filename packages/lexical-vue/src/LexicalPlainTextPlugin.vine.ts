import { useCanShowPlaceholder } from './composables'
import { useLexicalComposer } from './LexicalComposer.vine'
import { LexicalDecoratedTeleports } from './LexicalDecoratedTeleports'
import { usePlainTextSetup } from './shared/usePlainTextSetup'

export function LexicalPlainTextPlugin() {
  const editor = useLexicalComposer()
  const showPlaceholder = useCanShowPlaceholder(editor)
  usePlainTextSetup(editor)

  vineSlots<{
    placeholder: () => any
    contentEditable: () => any
  }>()

  return vine`
    <slot v-if="showPlaceholder" name="placeholder" />
    <slot name="contentEditable" />
    <LexicalDecoratedTeleports />
  `
}
