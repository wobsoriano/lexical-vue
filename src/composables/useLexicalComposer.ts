import { inject } from 'vue'
import invariant from 'tiny-invariant'
import type { LexicalEditor } from 'lexical'
import { LexicalEditorProviderKey } from './inject'

export function useLexicalComposer() {
  const editor = inject<LexicalEditor>(LexicalEditorProviderKey)

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
