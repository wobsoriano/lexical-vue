import { defineComponent } from 'vue'
import { useLexicalComposer } from './LexicalComposer'
import { useDecorators } from './shared/useDecorators'

export const LexicalDecoratedTeleports = defineComponent({
  name: 'LexicalDecoratedTeleports',
  setup() {
    const editor = useLexicalComposer()
    const decorators = useDecorators(editor)

    return () => decorators.value
  },
})
