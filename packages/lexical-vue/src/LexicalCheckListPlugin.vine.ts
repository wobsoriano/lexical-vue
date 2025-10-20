import { registerCheckList } from '@lexical/list'
import { onMounted, onUnmounted } from 'vue'
import { useLexicalComposer } from './composables'

export function LexicalCheckListPlugin() {
  const editor = useLexicalComposer()

  onMounted(() => {
    const unregister = registerCheckList(editor)

    onUnmounted(unregister)
  })

  return vine``
}
