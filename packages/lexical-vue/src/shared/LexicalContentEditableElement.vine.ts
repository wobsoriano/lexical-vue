import type { LexicalEditor } from 'lexical'
import type { HTMLAttributes } from '../types'
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { convertCamelToKebab } from '../types'

export type Props = {
  editor: LexicalEditor
} & Omit<HTMLAttributes, 'placeholder'>

export function ContentEditableElement(props: Props) {
  const root = useTemplateRef('root')
  const isEditable = ref(props.editor.isEditable())

  const otherAttrs = computed(() => {
    const { editor: _, ...rest } = props
    return convertCamelToKebab(rest)
  })

  onMounted(() => {
    function handleRef(rootElement: HTMLElement | null) {
    // defaultView is required for a root element.
    // In multi-window setups, the defaultView may not exist at certain points.
      if (
        rootElement
        && rootElement.ownerDocument
        && rootElement.ownerDocument.defaultView
      ) {
        props.editor.setRootElement(rootElement)
      }
      else {
        props.editor.setRootElement(null)
      }
    }

    handleRef(root.value)

    isEditable.value = props.editor.isEditable()
    const unregister = props.editor.registerEditableListener((currentIsEditable) => {
      isEditable.value = currentIsEditable
    })

    onUnmounted(unregister)
  })

  const roleWithDefault = computed(() => props.role ?? 'textbox')

  return vine`
    <div
        ref="root"
        v-bind="otherAttrs"
        :aria-activedescendant="isEditable ? ariaActivedescendant : undefined"
        :aria-autocomplete="isEditable ? ariaAutocomplete : 'none'"
        :aria-controls="isEditable ? ariaControls : undefined"
        :aria-describedby="ariaDescribedby"
        :aria-expanded="isEditable && roleWithDefault === 'combobox' ? !!ariaExpanded : undefined"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-multiline="ariaMultiline"
        :aria-owns="isEditable ? ariaOwns : undefined"
        :aria-readonly="isEditable ? undefined : true"
        :aria-required="ariaRequired"
        :autocapitalize="autocapitalize"
        :contenteditable="isEditable"
        :role="isEditable ? roleWithDefault : undefined"
        :spellcheck="spellcheck || true"
        :tabindex="tabindex"
    />
  `
}
