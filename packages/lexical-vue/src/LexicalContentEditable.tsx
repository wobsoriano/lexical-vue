import type { ContentEditableElementProps as ElementProps } from './shared/LexicalContentEditableElement'
import { defineComponent, h } from 'vue'
import { useLexicalComposer } from './LexicalComposer'
import { ContentEditableElement } from './shared/LexicalContentEditableElement'
import { useCanShowPlaceholder } from './shared/useCanShowPlaceholder'

type ContentEditableProps = Omit<ElementProps, 'editor' | 'placeholder'>

export const ContentEditable = defineComponent(
  (
    _props: ContentEditableProps,
    ctx: { attrs: Record<string, unknown>; slots: { placeholder?: () => any } },
  ) => {
    const editor = useLexicalComposer()
    const showPlaceholder = useCanShowPlaceholder(editor)

    return () => (
      <>
        {h(ContentEditableElement, {
          ...ctx.attrs,
          editor,
          role: (ctx.attrs.role as string | undefined) ?? 'textbox',
        })}
        {showPlaceholder.value ? <div aria-hidden="true">{ctx.slots.placeholder?.()}</div> : null}
      </>
    )
  },
  { name: 'ContentEditable', inheritAttrs: false },
)
