import { inject, onUnmounted, shallowRef, triggerRef } from 'vue'
import type { LexicalEditor } from 'lexical'
import { LexicalEditorProviderKey } from './inject'

export function useReactiveEditor() {
  const editor = inject<LexicalEditor>(LexicalEditorProviderKey)

  if (!editor)
    throw new Error('<LexicalComposer /> is required')

  const editorRef = shallowRef(editor)

  const unregisterListener = editor.registerUpdateListener(() => {
    triggerRef(editorRef)
  })

  onUnmounted(() => {
    unregisterListener()
  })

  return editorRef
}
