import { namedSignals } from '@lexical/extension'
import { registerClickableLink } from '@lexical/link'
import { defineComponent, watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'

export const ClickableLinkPlugin = defineComponent(
  (props: { newTab?: boolean; disabled?: boolean }) => {
    const editor = useLexicalComposer()

    watchEffect((onInvalidate) => {
      const unregister = registerClickableLink(
        editor,
        namedSignals({ disabled: props.disabled!, newTab: props.newTab! }),
      )

      onInvalidate(unregister)
    })

    return () => null
  },
  {
    name: 'ClickableLinkPlugin',
    props: {
      newTab: { type: Boolean, default: true },
      disabled: { type: Boolean, default: false },
    },
  },
)
