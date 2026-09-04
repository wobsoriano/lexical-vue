import type { LinkAttributes } from '@lexical/link'
import { namedSignals } from '@lexical/extension'

import { LinkNode, registerLink } from '@lexical/link'
import { defineComponent, watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'

export const LinkPlugin = defineComponent(
  (props: { validateUrl?: (url: string) => boolean; attributes?: LinkAttributes }) => {
    const editor = useLexicalComposer()

    watchEffect((onInvalidate) => {
      if (!editor.hasNodes([LinkNode]))
        throw new Error('LinkPlugin: LinkNode not registered on editor')

      const unregister = registerLink(
        editor,
        namedSignals({ attributes: props.attributes, validateUrl: props.validateUrl }),
      )

      onInvalidate(unregister)
    })

    return () => null
  },
  { name: 'LinkPlugin', props: ['validateUrl', 'attributes'] },
)
