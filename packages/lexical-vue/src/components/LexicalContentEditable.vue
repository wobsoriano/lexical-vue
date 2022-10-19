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
  editable?: boolean
  role?: string
  spellcheck?: boolean
  tabindex?: number
  enableGrammarly?: boolean
}>(), {
  role: 'textbox',
  spellcheck: true,
})
const editable = ref(true)

onMounted(() => {
  if (root.value) {
    editor.setRootElement(root.value)
    editable.value = editor.isEditable()
  }
})

const unregisterListener = editor.registerEditableListener((currentIsEditable) => {
  editable.value = currentIsEditable
})

onUnmounted(() => {
  unregisterListener?.()
})
</script>

<template>
  <div
    :id="id"
    ref="root"
    :aria-activedescendant="!editable ? undefined : ariaActivedescendant"
    :aria-autocomplete="!editable ? undefined : ariaAutocomplete"
    :aria-controls="!editable ? undefined : ariaControls"
    :aria-describedby="ariaDescribedby"
    :aria-expanded="!editable ? undefined : role === 'combobox' ? !!ariaExpanded ? ariaExpanded : undefined : undefined"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-multiline="ariaMultiline"
    :aria-owns="!editable ? undefined : ariaOwns"
    :aria-required="ariaRequired"
    :autocapitalize="`${autoCapitalize}`"
    :autocomplete="autoComplete"
    :autocorrect="`${autoCorrect}`"
    :contenteditable="editable"
    :role="!editable ? undefined : role"
    :spellcheck="spellcheck"
    :tabindex="tabindex"
  />
</template>
