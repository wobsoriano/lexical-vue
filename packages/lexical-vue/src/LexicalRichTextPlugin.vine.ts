import { useLexicalComposer } from './LexicalComposer.vine'
import { LexicalDecoratedTeleports } from './LexicalDecoratedTeleports'
import { useCanShowPlaceholder } from './shared/useCanShowPlaceholder'
import { useRichTextSetup } from './shared/useRichTextSetup'

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
