import { inject } from 'vue'
import { editorKey } from './inject'

export function useEditor() {
  const editor = inject(editorKey)

  if (!editor)
    throw new Error('<LexicalComposer /> is required')

  return editor
}
