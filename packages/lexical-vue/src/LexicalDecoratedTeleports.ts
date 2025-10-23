import { defineComponent } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'
import { useDecorators } from './shared/useDecorators'

export const LexicalDecoratedTeleports = defineComponent({
  name: 'LexicalDecoratedTeleports',
  setup() {
    const editor = useLexicalComposer()
    const decorators = useDecorators(editor)

    return () => decorators.value
  },
})
