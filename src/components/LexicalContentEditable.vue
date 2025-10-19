<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useLexicalComposer } from '../composables'
import { useCanShowPlaceholder } from '../composables/useCanShowPlaceholder'
import type { Props as ElementProps } from './LexicalContentEditableElement.vue'
import LexicalContentEditableElement from './LexicalContentEditableElement.vue'

type ContentEditableProps = Omit<ElementProps, 'editor' | 'placeholder'>

withDefaults(defineProps<ContentEditableProps>(), {
  role: 'textbox',
  spellcheck: true,
})

const editor = useLexicalComposer()
const isEditable = ref(false)
const showPlaceholder = useCanShowPlaceholder(editor)

onMounted(() => {
  isEditable.value = editor.isEditable()
  const unregister = editor.registerEditableListener((currentIsEditable) => {
    isEditable.value = currentIsEditable
  })

  onUnmounted(unregister)
})
</script>

<template>
  <LexicalContentEditableElement
    :editor
    v-bind="$props"
  />
  <div
    v-if="showPlaceholder"
    aria-hidden="true"
  >
    <slot name="placeholder" />
  </div>
</template>
