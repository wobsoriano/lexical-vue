import { inject } from 'vue'
import { editorKey } from './inject'

export function useLexicalComposer() {
  const editor = inject(editorKey)

  if (!editor)
    throw new Error('<LexicalComposer /> is required')

  return editor
}

/**
 * @deprecated use `useLexicalComposer` instead
 */
export const useEditor = useLexicalComposer
