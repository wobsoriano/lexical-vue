import { defineComponent } from 'vue'
import { useLexicalComposer } from './LexicalComposer'
import { useDecoratorHost } from './shared/useDecorators'

export const LexicalDecoratedTeleports = defineComponent({
  name: 'LexicalDecoratedTeleports',
  setup() {
    const decorators = useDecoratorHost(useLexicalComposer())

    return () => decorators.value
  },
})
