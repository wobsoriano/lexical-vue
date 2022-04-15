import * as lexicalDragon from '@lexical/dragon'
import { registerRichText } from '@lexical/rich-text'
import { mergeRegister } from '@lexical/utils'
import type { EditorState, LexicalEditor } from 'lexical'
import { onUnmounted } from 'vue'

export function useRichTextSetup(editor: LexicalEditor, initialEditorState?: null | string | EditorState | (() => void)) {
  const unsub = mergeRegister(
    registerRichText(editor, initialEditorState),
    // @ts-expect-error: Lexical dragon esm when?
    lexicalDragon.registerDragonSupport(editor),
  )

  onUnmounted(() => {
    unsub()
  })
}
