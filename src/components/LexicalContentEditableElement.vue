<script setup lang="ts">
import type { LexicalEditor } from 'lexical'
import type { AriaAttributes, CSSProperties } from 'vue'
import { computed, ref, useAttrs } from 'vue'
import { useMounted } from '../composables/useMounted'

export interface Props {
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
  autocapitalize?: string
  role?: string
  spellcheck?: boolean
  style?: CSSProperties
  class?: string
  tabIndex?: number
  dataTestid?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  role: 'textbox',
  spellcheck: true,
})

const root = ref<HTMLElement | null>(null)
const isEditable = ref(props.editor.isEditable())
const attrs = useAttrs()

const otherAttrs = computed(() => {
  // for compat, only override if defined
  const ariaAttrs: Record<string, string | boolean> = {}
  if (props.ariaInvalid != null)
    ariaAttrs['aria-invalid'] = props.ariaInvalid
  if (props.ariaErrorMessage != null)
    ariaAttrs['aria-errormessage'] = props.ariaErrorMessage
  return {
    ...attrs,
    ...ariaAttrs,
  }
})

useMounted(() => {
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
  return props.editor.registerEditableListener((currentIsEditable) => {
    isEditable.value = currentIsEditable
  })
})
</script>

<template>
  <div
    :id="id"
    ref="root"
    v-bind="otherAttrs"
    :aria-activedescendant="isEditable ? ariaActiveDescendant : undefined"
    :aria-autocomplete="isEditable ? ariaAutoComplete : 'none'"
    :aria-controls="isEditable ? ariaControls : undefined"
    :aria-describedby="ariaDescribedBy"
    :aria-expanded="isEditable && role === 'combobox' ? !!ariaExpanded : undefined"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledBy"
    :aria-multiline="ariaMultiline"
    :aria-owns="isEditable ? ariaOwns : undefined"
    :aria-readonly="isEditable ? undefined : true"
    :aria-required="ariaRequired"
    :autocapitalize="autocapitalize"
    :contenteditable="isEditable"
    :data-testid="dataTestid"
    :role="isEditable ? role : undefined"
    :spellcheck="spellcheck"
    :style="style"
    :tabindex="tabIndex"
  />
</template>
