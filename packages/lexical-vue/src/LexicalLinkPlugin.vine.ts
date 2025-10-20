import type { LinkAttributes } from '@lexical/link'
import { namedSignals } from '@lexical/extension'

import {
  LinkNode,
  registerLink,
} from '@lexical/link'
import { watchEffect } from 'vue'
import { useLexicalComposer } from './composables'

export function LexicalLinkPlugin(props: {
  validateUrl?: (url: string) => boolean
  attributes?: LinkAttributes
}) {
  const editor = useLexicalComposer()

  watchEffect((onInvalidate) => {
    if (!editor.hasNodes([LinkNode]))
      throw new Error('LinkPlugin: LinkNode not registered on editor')

    const unregister = registerLink(editor, namedSignals({ attributes: props.attributes, validateUrl: props.validateUrl }))

    onInvalidate(unregister)
  })

  return vine``
}
