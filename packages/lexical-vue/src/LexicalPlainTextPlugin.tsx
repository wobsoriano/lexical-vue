import { defineComponent } from 'vue'
import { useLexicalComposer } from './LexicalComposer'
import { useCanShowPlaceholder } from './shared/useCanShowPlaceholder'
import { useDecoratorHost } from './shared/useDecorators'
import { usePlainTextSetup } from './shared/usePlainTextSetup'

export const PlainTextPlugin = defineComponent(
  (_props: object, ctx: { slots: { placeholder?: () => any; contentEditable?: () => any } }) => {
    const editor = useLexicalComposer()
    const showPlaceholder = useCanShowPlaceholder(editor)
    const nodeDecorators = useDecoratorHost(editor)
    usePlainTextSetup(editor)

    return () => (
      <>
        {showPlaceholder.value ? ctx.slots.placeholder?.() : null}
        {ctx.slots.contentEditable?.()}
        {nodeDecorators.value}
      </>
    )
  },
  {
    name: 'PlainTextPlugin',
  },
)
