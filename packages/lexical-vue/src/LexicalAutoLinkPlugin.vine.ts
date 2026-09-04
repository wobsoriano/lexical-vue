import type { ChangeHandler, LinkMatcher } from '@lexical/link'
import type { ElementNode, LexicalEditor } from 'lexical'
import type { MaybeRefOrGetter } from 'vue'
import { AutoLinkNode, registerAutoLink } from '@lexical/link'

import invariant from 'tiny-invariant'

import { toValue, watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'

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

export function AutoLinkPlugin(props: {
  matchers: LinkMatcher[]
  excludeParents?: Array<(parent: ElementNode) => boolean>
}) {
  const emit = vineEmits<{
    change?: [value: { url: string | null; prevUrl: string | null }]
  }>()

  const editor = useLexicalComposer()

  useAutoLink(
    editor,
    () => props.matchers,
    (url: string | null, prevUrl: string | null) => {
      emit('change', {
        url,
        prevUrl,
      })
    },
    () => props.excludeParents,
  )

  return vine``
}
