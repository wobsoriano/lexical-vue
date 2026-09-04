import type { HistoryState } from '@lexical/history'
import { defineComponent } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'
import { useHistory } from './shared/useHistory'

export const HistoryPlugin = defineComponent(
  (props: { delay?: number; externalHistoryState?: HistoryState }) => {
    const editor = useLexicalComposer()
    useHistory(
      editor,
      () => props.externalHistoryState,
      () => props.delay,
    )

    return () => null
  },
  { name: 'HistoryPlugin', props: ['delay', 'externalHistoryState'] },
)
