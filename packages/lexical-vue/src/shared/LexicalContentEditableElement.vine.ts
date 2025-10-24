import type { LexicalEditor } from 'lexical'
import type { AriaAttributes, HTMLAttributes } from 'vue'
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'

export type ContentEditableElementProps = {
  editor: LexicalEditor
  ariaActiveDescendant?: AriaAttributes['aria-activedescendant']
  ariaAutoComplete?: AriaAttributes['aria-autocomplete']
  ariaControls?: AriaAttributes['aria-controls']
  ariaDescribedBy?: AriaAttributes['aria-describedby']
  ariaErrorMessage?: AriaAttributes['aria-errormessage']
  ariaExpanded?: AriaAttributes['aria-expanded']
  ariaInvalid?: AriaAttributes['aria-invalid']
  ariaLabel?: AriaAttributes['aria-label']
  ariaLabelledBy?: AriaAttributes['aria-labelledby']
  ariaMultiline?: AriaAttributes['aria-multiline']
  ariaOwns?: AriaAttributes['aria-owns']
  ariaRequired?: AriaAttributes['aria-required']
} & Omit<HTMLAttributes, 'placeholder'>

export function ContentEditableElement(props: ContentEditableElementProps) {
  const root = useTemplateRef('root')
  const isEditable = ref(props.editor.isEditable())

  const otherAttrs = computed(() => {
    const { editor: _, ...rest } = props
    return rest
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
        :aria-activedescendant="isEditable ? ariaActiveDescendant : undefined"
        :aria-autocomplete="isEditable ? ariaAutoComplete : 'none'"
        :aria-controls="isEditable ? ariaControls : undefined"
        :aria-describedby="ariaDescribedBy"
        :aria-expanded="isEditable && roleWithDefault === 'combobox' ? !!ariaExpanded : undefined"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledBy"
        :aria-multiline="ariaMultiline"
        :aria-owns="isEditable ? ariaOwns : undefined"
        :aria-readonly="isEditable ? undefined : true"
        :aria-required="ariaRequired"
        :autocapitalize
        :contenteditable="isEditable"
        :role="isEditable ? roleWithDefault : undefined"
        :spellcheck="spellcheck || true"
        :tabindex="tabindex"
    />
  `
}
