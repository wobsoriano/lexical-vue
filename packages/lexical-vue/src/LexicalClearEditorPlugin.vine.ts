import { registerClearEditor } from '@lexical/extension'
import { onMounted, onUnmounted } from 'vue'
import { useLexicalComposer } from './composables'

export function LexicalClearEditorPlugin() {
  const editor = useLexicalComposer()

  const emit = vineEmits<{
    clear: []
  }>()

  onMounted(() => {
    const unregister = registerClearEditor(editor, () => {
      emit('clear')
    })

    onUnmounted(unregister)
  })

  return vine``
}
