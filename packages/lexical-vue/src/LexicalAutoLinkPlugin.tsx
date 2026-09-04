import type { ChangeHandler, LinkMatcher } from '@lexical/link'
import type { ElementNode, LexicalEditor } from 'lexical'
import type { MaybeRefOrGetter } from 'vue'
import { AutoLinkNode, registerAutoLink } from '@lexical/link'

import invariant from 'tiny-invariant'

import { defineComponent, toValue, watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer'

export { type ChangeHandler, createLinkMatcherWithRegExp, type LinkMatcher } from '@lexical/link'

function useAutoLink(
  editor: LexicalEditor,
  matchers: MaybeRefOrGetter<Array<LinkMatcher>>,
  onChange?: ChangeHandler,
  excludeParents?: MaybeRefOrGetter<Array<(parent: ElementNode) => boolean> | undefined>,
) {
  watchEffect((onInvalidate) => {
    if (!editor.hasNodes([AutoLinkNode]))
      invariant(false, 'LexicalAutoLinkPlugin: AutoLinkNode not registered on editor')

    const unregister = registerAutoLink(editor, {
      changeHandlers: onChange ? [onChange] : [],
      excludeParents: toValue(excludeParents) ?? [],
      matchers: toValue(matchers),
    })

    onInvalidate(unregister)
  })
}

export const AutoLinkPlugin = defineComponent(
  (
    props: {
      matchers: LinkMatcher[]
      excludeParents?: Array<(parent: ElementNode) => boolean>
    },
    ctx: {
      emit: (event: 'change', value: { url: string | null; prevUrl: string | null }) => void
    },
  ) => {
    const editor = useLexicalComposer()

    useAutoLink(
      editor,
      () => props.matchers,
      (url: string | null, prevUrl: string | null) => {
        ctx.emit('change', {
          url,
          prevUrl,
        })
      },
      () => props.excludeParents,
    )

    return () => null
  },
  {
    name: 'AutoLinkPlugin',
    props: ['matchers', 'excludeParents'],
    emits: { change: (_value: { url: string | null; prevUrl: string | null }) => true },
  },
)
