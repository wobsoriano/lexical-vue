import { registerDragonSupport } from '@lexical/dragon'
import { registerPlainText } from '@lexical/plain-text'
import { mergeRegister } from '@lexical/utils'
import type { LexicalEditor } from 'lexical'
import { useMounted } from './useMounted'

export function usePlainTextSetup(editor: LexicalEditor) {
  useMounted(() => {
    return mergeRegister(
      registerPlainText(editor),
      registerDragonSupport(editor),
    )
  })
}
