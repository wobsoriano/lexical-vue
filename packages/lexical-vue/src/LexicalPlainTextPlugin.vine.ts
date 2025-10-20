import { useCanShowPlaceholder } from './composables'
import { useLexicalComposer } from './LexicalComposer.vine'
import { usePlainTextSetup } from './shared/usePlainTextSetup'

export function LexicalPlainTextPlugin() {
  const editor = useLexicalComposer()
  const showPlaceholder = useCanShowPlaceholder(editor)
  usePlainTextSetup(editor)

  vineSlots<{
    placeholder: (props: {}) => any
    contentEditable: (props: {}) => any
  }>()

  return vine`
    <slot v-if="showPlaceholder" name="placeholder" />
    <slot name="contentEditable" />
    <LexicalDecoratedTeleports />
  `
}
