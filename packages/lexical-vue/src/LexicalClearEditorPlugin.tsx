import { registerClearEditor } from '@lexical/extension'
import { defineComponent, onMounted, onUnmounted } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'

export const ClearEditorPlugin = defineComponent(
  (_props: object, ctx: { emit: (event: 'clear') => void }) => {
    const editor = useLexicalComposer()

    onMounted(() => {
      const unregister = registerClearEditor(editor, () => {
        ctx.emit('clear')
      })

      onUnmounted(unregister)
    })

    return () => null
  },
  { name: 'ClearEditorPlugin', emits: { clear: () => true } },
)
