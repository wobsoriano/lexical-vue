<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useEditor } from '../composables/useEditor'

const root = ref<HTMLElement | null>(null)
const editor = useEditor()

withDefaults(defineProps<{
  ariaActivedescendant?: string
  ariaAutocomplete?: 'none' | 'inline' | 'list' | 'both'
  ariaControls?: string
  ariaDescribedby?: string
  ariaExpanded?: boolean
  ariaLabel?: string
  ariaLabelledby?: string
  ariaMultiline?: boolean
  ariaOwns?: string
  ariaRequired?: boolean
  autoCapitalize?: boolean
  autoComplete?: boolean
  autoCorrect?: boolean
  id?: string
  readOnly?: boolean
  role?: string
  spellcheck?: boolean
  tabindex?: number
  enableGrammarly?: boolean
}>(), {
  role: 'textbox',
  spellcheck: true,
  enableGrammarly: true,
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
    :aria-activedescendant="isReadOnly ? undefined : ariaActivedescendant"
    :aria-autocomplete="isReadOnly ? undefined : ariaAutocomplete"
    :aria-controls="isReadOnly ? undefined : ariaControls"
    :aria-describedby="ariaDescribedby"
    :aria-expanded="isReadOnly ? undefined : role === 'combobox' ? !!ariaExpanded ? ariaExpanded : undefined : undefined"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-multiline="ariaMultiline"
    :aria-owns="isReadOnly ? undefined : ariaOwns"
    :aria-required="ariaRequired"
    :autocapitalize="`${autoCapitalize}`"
    :autocomplete="autoComplete"
    :autocorrect="`${autoCorrect}`"
    :contenteditable="!isReadOnly"
    :role="isReadOnly ? undefined : role"
    :spellcheck="spellcheck"
    :tabindex="tabindex"
    :data-enable-grammarly="enableGrammarly"
  />
</template>
