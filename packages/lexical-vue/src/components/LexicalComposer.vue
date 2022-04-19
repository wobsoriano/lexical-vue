<script setup lang="ts">
import { onMounted, provide } from 'vue'
import type { EditorState, EditorThemeClasses, LexicalEditor, LexicalNode } from 'lexical'
import { createEditor } from 'lexical'
import { editorKey } from '../composables/inject'

const props = defineProps<{
  initialConfig: {
    namespace?: string
    editorState?: EditorState
    theme?: EditorThemeClasses
    context?: unknown
    parentEditor?: LexicalEditor
    nodes?: LexicalNode[]
    onError: (error: Error) => void
    disableEvents?: boolean
    readOnly?: boolean
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
