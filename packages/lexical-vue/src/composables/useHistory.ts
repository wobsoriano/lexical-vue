import type { HistoryState } from '@lexical/history'
import type { LexicalEditor } from 'lexical'
import type { Ref } from 'vue'
import { computed, onUnmounted, watchEffect } from 'vue'

import { createEmptyHistoryState, registerHistory } from '@lexical/history'
import { getRealValue } from '../utils'

export function useHistory(
  editor: LexicalEditor,
  externalHistoryState?: Ref<HistoryState> | HistoryState,
  delay?: Ref<number> | number,
) {
  const historyState = computed<HistoryState>(
    () => getRealValue(externalHistoryState) || createEmptyHistoryState(),
  )
  let unregisterListener: () => void

  watchEffect((onInvalidate) => {
    unregisterListener = registerHistory(editor, historyState.value, getRealValue(delay) || 1000)
    onInvalidate(() => {
      unregisterListener()
    })
  })

  onUnmounted(() => {
    unregisterListener?.()
  })
}
