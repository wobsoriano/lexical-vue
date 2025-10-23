import type { HistoryState } from '@lexical/history'
import { useLexicalComposer } from './LexicalComposer.vine'
import { useHistory } from './shared/useHistory'

export function HistoryPlugin(props: {
  delay?: number
  externalHistoryState?: HistoryState
}) {
  const editor = useLexicalComposer()
  useHistory(editor, () => props.externalHistoryState, () => props.delay)

  return vine``
}
