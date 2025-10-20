import { useCanShowPlaceholder, useLexicalComposer, useRichTextSetup } from './composables'
import { LexicalDecoratedTeleports } from './LexicalDecoratedTeleports'

export function LexicalRichextPlugin() {
  const editor = useLexicalComposer()
  const showPlaceholder = useCanShowPlaceholder(editor)
  useRichTextSetup(editor)

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
