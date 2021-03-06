import { defineComponent } from 'vue'
import { useDecorators } from '../composables/useDecorators'
import { useEditor } from '../composables/useEditor'

export default defineComponent({
  setup() {
    const editor = useEditor()
    const decorators = useDecorators(editor)

    return () => decorators.value
  },
})
