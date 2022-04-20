<script setup lang="ts">
import { onMounted, provide } from 'vue'
import type { EditorThemeClasses, LexicalNode } from 'lexical'
import { createEditor } from 'lexical'
import { editorKey } from '../composables/inject'

const props = defineProps<{
  initialConfig: {
    namespace?: string
    nodes?: Array<LexicalNode>
    readOnly?: boolean
    theme?: EditorThemeClasses
  }
}>()

const emit = defineEmits<{
  (e: 'error', error: Error): void
}>()

const editor = createEditor({
  ...props.initialConfig,
  onError(error) {
    emit('error', error)
  },
})

provide(editorKey, editor)

onMounted(() => {
  const isReadOnly = props.initialConfig.readOnly

  editor.setReadOnly(isReadOnly || false)
})
</script>

<template>
  <slot />
</template>
