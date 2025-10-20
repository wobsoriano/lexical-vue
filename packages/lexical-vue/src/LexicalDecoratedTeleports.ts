import { defineComponent } from 'vue'
import { useDecorators } from './composables'
import { useLexicalComposer } from './LexicalComposer.vine'

export const LexicalDecoratedTeleports = defineComponent({
  name: 'LexicalDecoratedTeleports',
  setup() {
    const editor = useLexicalComposer()
    const decorators = useDecorators(editor)

    return () => decorators.value
  },
})
