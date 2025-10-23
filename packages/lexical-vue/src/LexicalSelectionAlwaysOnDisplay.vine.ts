import { selectionAlwaysOnDisplay } from '@lexical/utils'
import { onMounted, onUnmounted } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'

export function LexicalSelectionAlwaysOnDisplay() {
  const editor = useLexicalComposer()

  onMounted(() => {
    const unregister = selectionAlwaysOnDisplay(editor)

    onUnmounted(() => {
      unregister()
    })
  })
  return vine``
}
