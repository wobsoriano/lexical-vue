import type { ContentEditableElementProps as ElementProps } from './shared/LexicalContentEditableElement'
import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  onMounted,
  onUnmounted,
  onUpdated,
  ref,
} from 'vue'
import { useLexicalComposer } from './LexicalComposer'
import { ContentEditableElement } from './shared/LexicalContentEditableElement'
import { useCanShowPlaceholder } from './shared/useCanShowPlaceholder'

type ContentEditableProps = Omit<ElementProps, 'editor' | 'placeholder'>

export const ContentEditable = defineComponent(
  (
    _props: ContentEditableProps,
    ctx: { attrs: Record<string, unknown>; slots: { placeholder?: () => any } },
  ) => {
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

    const shouldSpellcheck = computed(() => (hasSpellcheck.value ? ctx.attrs.spellcheck : true))

    onMounted(() => {
      isEditable.value = editor.isEditable()
      const unregister = editor.registerEditableListener((currentIsEditable) => {
        isEditable.value = currentIsEditable
      })

      onUnmounted(unregister)
    })

    return () => (
      <>
        {h(ContentEditableElement, {
          ...ctx.attrs,
          editor,
          role: (ctx.attrs.role as string | undefined) ?? 'textbox',
          spellcheck: shouldSpellcheck.value as boolean,
        })}
        {showPlaceholder.value ? <div aria-hidden="true">{ctx.slots.placeholder?.()}</div> : null}
      </>
    )
  },
  { name: 'ContentEditable', inheritAttrs: false },
)
