import { getActiveElement } from 'lexical'
import { defineComponent, nextTick, onMounted } from 'vue'
import { useLexicalComposer } from './LexicalComposer'

export const AutoFocusPlugin = defineComponent(
  (props: { defaultSelection?: 'rootStart' | 'rootEnd' }) => {
    const editor = useLexicalComposer()

    onMounted(() => {
      nextTick(() => {
        editor.focus(
          () => {
            // Selection API is not Focus API: moving selection to the same point does not
            // re-focus the element, so a plugin named for focus has to correct that itself.
            const rootElement = editor.getRootElement() as HTMLDivElement
            const activeElement = rootElement !== null ? getActiveElement(rootElement) : null
            if (
              rootElement !== null &&
              (activeElement === null || !rootElement.contains(activeElement))
            ) {
              // preventScroll does not work in Webkit.
              rootElement.focus({ preventScroll: true })
            }
          },
          { defaultSelection: props.defaultSelection },
        )
      })
    })

    return () => null
  },
  { name: 'AutoFocusPlugin', props: ['defaultSelection'] },
)
