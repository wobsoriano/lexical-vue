import type { Props as ElementProps } from './shared/LexicalContentEditableElement.vine'
import { onMounted, onUnmounted, ref } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'
import { LexicalContentEditableElement } from './shared/LexicalContentEditableElement.vine'
import { useCanShowPlaceholder } from './shared/useCanShowPlaceholder'

type ContentEditableProps = Omit<ElementProps, 'editor' | 'placeholder'>

export function LexicalContentEditable(props: ContentEditableProps) {
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
    <LexicalContentEditableElement
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
