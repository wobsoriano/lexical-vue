import type { ContentEditableElementProps as ElementProps } from './shared/LexicalContentEditableElement.vine'
import { computed, getCurrentInstance, onMounted, onUnmounted, onUpdated, ref } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'
import { ContentEditableElement } from './shared/LexicalContentEditableElement.vine'
import { useCanShowPlaceholder } from './shared/useCanShowPlaceholder'

type ContentEditableProps = Omit<ElementProps, 'editor' | 'placeholder'>

export function ContentEditable(props: ContentEditableProps) {
  const instance = getCurrentInstance()
  const editor = useLexicalComposer()
  const isEditable = ref(false)
  const showPlaceholder = useCanShowPlaceholder(editor)

  function hasSpellcheckProp() {
    const vnodeProps = instance?.vnode.props
    return vnodeProps != null && ('spellcheck' in vnodeProps || 'spellCheck' in vnodeProps)
  }

  const hasSpellcheck = ref(hasSpellcheckProp())

  onUpdated(() => {
    hasSpellcheck.value = hasSpellcheckProp()
  })

  const shouldSpellcheck = computed(() => (hasSpellcheck.value ? props.spellcheck : true))

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
            spellcheck: shouldSpellcheck,
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
