import { HashtagNode, registerLexicalHashtag } from '@lexical/hashtag'
import { defineComponent, watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer'

export const HashtagPlugin = defineComponent(
  () => {
    const editor = useLexicalComposer()

    watchEffect((onInvalidate) => {
      if (!editor.hasNodes([HashtagNode])) {
        throw new Error('HashtagPlugin: HashtagNode not registered on editor')
      }

      onInvalidate(registerLexicalHashtag(editor))
    })

    return () => null
  },
  { name: 'HashtagPlugin' },
)
