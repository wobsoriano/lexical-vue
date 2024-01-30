import { inject } from 'vue'
import invariant from 'tiny-invariant'
import { editorKey } from './inject'

export function useLexicalComposer() {
  const editor = inject(editorKey)

  if (!editor) {
    invariant(
      false,
      'useLexicalComposer: cannot find a LexicalComposer',
    )
  }

  return editor
}

/**
 * @deprecated use `useLexicalComposer` instead
 */
export const useEditor = useLexicalComposer
