import type { ContentEditableElementProps as ElementProps } from './shared/LexicalContentEditableElement.vine'
import { onMounted, onUnmounted, ref } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'
import { ContentEditableElement } from './shared/LexicalContentEditableElement.vine'
import { useCanShowPlaceholder } from './shared/useCanShowPlaceholder'

type ContentEditableProps = Omit<ElementProps, 'editor' | 'placeholder'>

export function ContentEditable(props: ContentEditableProps) {
  const editor = useLexicalComposer()
  const isEditable = ref(false)
  const showPlaceholder = useCanShowPlaceholder(editor)

  onMounted(() => {
    isEditable.value = editor.isEditable()
    const unregister = editor.registerEditableListener((currentIsEditable) => {
      isEditable.value = currentIsEditable
    })

    onUnmounted(unregister)
  })

  vineSlots<{
    placeholder: () => any
  }>()

  return vine`
    <ContentEditableElement
        :editor
        v-bind="{
            ...$props,
            role: role ?? 'textbox',
            spellcheck: spellcheck ?? true,
        }"
    />
    <div
        v-if="showPlaceholder"
        aria-hidden="true"
    >
        <slot name="placeholder" />
    </div>
  `
}
