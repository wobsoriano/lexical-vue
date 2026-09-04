import { defineComponent } from 'vue'
import { useLexicalComposer } from './LexicalComposer'
import { LexicalDecoratedTeleports } from './LexicalDecoratedTeleports'
import { useCanShowPlaceholder } from './shared/useCanShowPlaceholder'
import { usePlainTextSetup } from './shared/usePlainTextSetup'

export const PlainTextPlugin = defineComponent(
  (_props: object, ctx: { slots: { placeholder?: () => any; contentEditable?: () => any } }) => {
    const editor = useLexicalComposer()
    const showPlaceholder = useCanShowPlaceholder(editor)
    usePlainTextSetup(editor)

    return () => (
      <>
        {showPlaceholder.value ? ctx.slots.placeholder?.() : null}
        {ctx.slots.contentEditable?.()}
        <LexicalDecoratedTeleports />
      </>
    )
  },
  { name: 'PlainTextPlugin' },
)
