import { useLexicalComposer } from './LexicalComposer.vine'
import { useCanShowPlaceholder } from './shared/useCanShowPlaceholder'
import { useRichTextSetup } from './shared/useRichTextSetup'

export function RichTextPlugin() {
  const editor = useLexicalComposer()
  const showPlaceholder = useCanShowPlaceholder(editor)
  useRichTextSetup(editor)

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
