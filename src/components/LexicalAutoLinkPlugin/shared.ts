import type { ChangeHandler, LinkMatcher } from '@lexical/link'
import type { LexicalEditor } from 'lexical'
import { toValue, watchEffect } from 'vue'
import invariant from 'tiny-invariant'

import {
  AutoLinkNode,
  registerAutoLink,
} from '@lexical/link'

import type { MaybeRefOrGetter } from 'vue'

export {
  type ChangeHandler,
  createLinkMatcherWithRegExp,
  type LinkMatcher,
} from '@lexical/link'

export function useAutoLink(
  editor: LexicalEditor,
  matchers: MaybeRefOrGetter<Array<LinkMatcher>>,
  onChange?: ChangeHandler,
) {
  watchEffect((onInvalidate) => {
    if (!editor.hasNodes([AutoLinkNode]))
      invariant(false, 'LexicalAutoLinkPlugin: AutoLinkNode not registered on editor')

    const unregister = registerAutoLink(editor, {
      changeHandlers: onChange ? [onChange] : [],
      matchers: toValue(matchers),
    })

    onInvalidate(unregister)
  })
}
