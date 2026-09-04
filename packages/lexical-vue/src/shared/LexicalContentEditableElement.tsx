import type { LexicalEditor } from 'lexical'
import type { AriaAttributes, HTMLAttributes } from 'vue'
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue'

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
  style?: any
} & Omit<HTMLAttributes, 'placeholder' | 'prefix' | 'style'>

const DECLARED_PROPS = [
  'editor',
  'ariaActiveDescendant',
  'ariaAutoComplete',
  'ariaControls',
  'ariaDescribedBy',
  'ariaErrorMessage',
  'ariaExpanded',
  'ariaInvalid',
  'ariaLabel',
  'ariaLabelledBy',
  'ariaMultiline',
  'ariaOwns',
  'ariaRequired',
  'autocapitalize',
  'role',
  'spellcheck',
  'tabindex',
  'style',
] as const

export const ContentEditableElement = defineComponent(
  (props: ContentEditableElementProps, ctx: { attrs: Record<string, unknown> }) => {
    const root = ref<HTMLDivElement | null>(null)
    const isEditable = ref(props.editor.isEditable())

    onMounted(() => {
      function handleRef(rootElement: HTMLElement | null) {
        // defaultView is required for a root element.
        // In multi-window setups, the defaultView may not exist at certain points.
        if (rootElement && rootElement.ownerDocument && rootElement.ownerDocument.defaultView) {
          props.editor.setRootElement(rootElement)
        } else {
          props.editor.setRootElement(null)
        }
      }

      handleRef(root.value)

      isEditable.value = props.editor.isEditable()
      const unregister = props.editor.registerEditableListener((currentIsEditable) => {
        isEditable.value = currentIsEditable
      })

      onUnmounted(() => {
        unregister()
        props.editor.setRootElement(null)
      })
    })

    const roleWithDefault = computed(() => props.role ?? 'textbox')

    return () => (
      <div
        ref={root}
        {...ctx.attrs}
        aria-activedescendant={isEditable.value ? props.ariaActiveDescendant : undefined}
        aria-autocomplete={isEditable.value ? props.ariaAutoComplete : 'none'}
        aria-controls={isEditable.value ? props.ariaControls : undefined}
        aria-describedby={props.ariaDescribedBy}
        aria-errormessage={props.ariaErrorMessage}
        aria-expanded={
          isEditable.value && roleWithDefault.value === 'combobox'
            ? !!props.ariaExpanded
            : undefined
        }
        aria-invalid={props.ariaInvalid}
        aria-label={props.ariaLabel}
        aria-labelledby={props.ariaLabelledBy}
        aria-multiline={props.ariaMultiline}
        aria-owns={isEditable.value ? props.ariaOwns : undefined}
        aria-readonly={isEditable.value ? undefined : true}
        aria-required={props.ariaRequired}
        autocapitalize={props.autocapitalize}
        contenteditable={isEditable.value}
        role={isEditable.value ? roleWithDefault.value : undefined}
        spellcheck={props.spellcheck ?? true}
        style={props.style}
        tabindex={props.tabindex ?? (isEditable.value ? undefined : -1)}
      />
    )
  },
  { name: 'ContentEditableElement', props: [...DECLARED_PROPS], inheritAttrs: false },
)
