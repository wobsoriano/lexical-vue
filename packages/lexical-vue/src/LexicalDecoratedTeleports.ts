import { defineComponent } from 'vue'
import { useDecorators, useLexicalComposer } from './composables'

export const LexicalDecoratedTeleports = defineComponent({
  name: 'LexicalDecoratedTeleports',
  setup() {
    const editor = useLexicalComposer()
    const decorators = useDecorators(editor)

    return () => decorators.value
  },
})
