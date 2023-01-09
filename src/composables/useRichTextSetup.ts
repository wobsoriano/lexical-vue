import { registerDragonSupport } from '@lexical/dragon'
import { registerRichText } from '@lexical/rich-text'
import { mergeRegister } from '@lexical/utils'
import type { LexicalEditor } from 'lexical'
import { useMounted } from './useMounted'

export function useRichTextSetup(editor: LexicalEditor) {
  useMounted(() => {
    return mergeRegister(
      registerRichText(editor),
      registerDragonSupport(editor),
    )
  })
}
