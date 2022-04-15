<script setup lang="ts">
import { onMounted, onUnmounted, provide, ref } from 'vue'
import type { EditorThemeClasses, LexicalEditor, LexicalNode } from 'lexical'
import { createEditor } from 'lexical'
import { editorKey } from '../composables/inject'

const props = defineProps<{
  initialConfig: {
    editor__DEPRECATED?: LexicalEditor | null
    readOnly?: boolean
    namespace?: string
    nodes?: LexicalNode[]
    theme?: EditorThemeClasses
    onError: (error: Error) => void
  }
}>()

const editor = createEditor(props.initialConfig)

provide(editorKey, editor)

onMounted(() => {
  const isReadOnly = props.initialConfig.readOnly

  editor.setReadOnly(isReadOnly || false)
})
</script>

<template>
  <slot />
</template>
