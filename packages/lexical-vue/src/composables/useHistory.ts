import type { HistoryState } from '@lexical/history'
import type { LexicalEditor } from 'lexical'
import { type MaybeRefOrGetter, computed, toValue, watchEffect } from 'vue'

import { createEmptyHistoryState, registerHistory } from '@lexical/history'

export function useHistory(
  editor: MaybeRefOrGetter<LexicalEditor>,
  externalHistoryState?: MaybeRefOrGetter<HistoryState | undefined>,
  delay?: MaybeRefOrGetter<number | undefined>,
) {
  const historyState = computed<HistoryState>(
    () => toValue(externalHistoryState) || createEmptyHistoryState(),
  )

  watchEffect((onInvalidate) => {
    const unregisterListener = registerHistory(toValue(editor), historyState.value, toValue(delay) || 1000)

    onInvalidate(unregisterListener)
  })
}
