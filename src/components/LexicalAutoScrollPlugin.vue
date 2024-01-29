<script setup lang="ts">
import { $getSelection, $isRangeSelection } from 'lexical'
import { useLexicalComposer } from '../composables'
import { useMounted } from '../composables/useMounted'

const props = defineProps<{
  scrollRef: HTMLElement | null
}>()

const editor = useLexicalComposer()

useMounted(() => {
  return editor.registerUpdateListener(({ tags, editorState }) => {
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
})
</script>
