import { useCanShowPlaceholder } from './composables'
import { useLexicalComposer } from './LexicalComposer.vine'
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
