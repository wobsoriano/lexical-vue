import { registerCheckList } from '@lexical/list'
import { onMounted, onUnmounted } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'

export function CheckListPlugin() {
  const editor = useLexicalComposer()

  onMounted(() => {
    const unregister = registerCheckList(editor)

    onUnmounted(unregister)
  })

  return vine``
}
