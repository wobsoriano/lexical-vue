import { $getSelection, $isRangeSelection } from 'lexical'
import { onMounted, onUnmounted } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'

export function LexicalAutoScrollPlugin(props: {
  scrollRef: HTMLElement | null
}) {
  const editor = useLexicalComposer()

  onMounted(() => {
    const unregister = editor.registerUpdateListener(({ tags, editorState }) => {
      const scrollElement = props.scrollRef
      if (!scrollElement || !tags.has('scroll-into-view'))
        return

      const selection = editorState.read(() => $getSelection())
      if (!$isRangeSelection(selection) || !selection.isCollapsed())
        return

      const anchorElement = editor.getElementByKey(selection.anchor.key)
      if (anchorElement === null)
        return

      const scrollRect = scrollElement.getBoundingClientRect()
      const rect = anchorElement.getBoundingClientRect()
      if (rect.bottom > scrollRect.bottom)
        anchorElement.scrollIntoView(false)

      else if (rect.top < scrollRect.top)
        anchorElement.scrollIntoView()
    })

    onUnmounted(unregister)
  })

  return vine``
}
