<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useEditor } from '../composables/useEditor'

const root = ref<HTMLElement>()
const editor = useEditor()

withDefaults(defineProps<{
  ariaActivedescendant?: string
  ariaAutocomplete?: string
  ariaControls?: string
  ariaDescribedby?: string
  ariaExpanded?: boolean
  ariaLabel?: string
  ariaLabelledby?: string
  ariaMultiline?: boolean
  ariaOwns?: string
  ariaRequired?: string
  autoCapitalize?: boolean
  autoComplete?: boolean
  autoCorrect?: boolean
  id?: string
  readOnly?: boolean
  role?: string
  spellcheck?: boolean
  tabindex?: number
}>(), {
  role: 'textbox',
  spellcheck: true,
})
const isReadOnly = ref(true)
let unregisterListener: () => void

onMounted(() => {
  if (root.value)
    editor.setRootElement(root.value)

  unregisterListener = editor.registerReadOnlyListener((currentIsReadOnly) => {
    isReadOnly.value = currentIsReadOnly
  })
})

onUnmounted(() => {
  unregisterListener?.()
})
</script>

<template>
  <div
    :id="id"
    ref="root"
    :aria-activedescendant="isReadOnly ? null : ariaActivedescendant"
    :aria-autocomplete="isReadOnly ? null : ariaAutocomplete"
    :aria-controls="isReadOnly ? null : ariaControls"
    :aria-describedby="ariaDescribedby"
    :aria-expanded="isReadOnly ? null : role === 'combobox' ? !!ariaExpanded ? ariaExpanded : undefined : null"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-multiline="ariaMultiline"
    :aria-owns="isReadOnly ? null : ariaOwns"
    :aria-required="ariaRequired"
    :autocapitalize="`${autoCapitalize}`"
    :autocomplete="autoComplete"
    :autocorrect="`${autoCorrect}`"
    :contenteditable="!isReadOnly"
    :role="isReadOnly ? undefined : role"
    :spellcheck="spellcheck"
    :tabindex="tabindex"
  />
</template>
