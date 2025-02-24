<script setup lang="ts">
import { ref } from 'vue'
import { useLexicalComposer, useMounted } from '../composables'
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

useMounted(() => {
  isEditable.value = editor.isEditable()
  return editor.registerEditableListener((currentIsEditable) => {
    isEditable.value = currentIsEditable
  })
})
</script>

<template>
  <LexicalContentEditableElement
    :editor="editor"
    v-bind="$props"
  />
  <div
    v-if="showPlaceholder"
    aria-hidden="true"
  >
    <slot name="placeholder" />
  </div>
</template>
