<script setup lang="ts">
import { onMounted, provide } from 'vue'
import type { EditorState, EditorThemeClassName, EditorThemeClasses, LexicalEditor, LexicalNode } from 'lexical'
import { createEditor } from 'lexical'
import { editorKey } from '../composables/inject'

const props = defineProps<{
  initialConfig: {
    editor__DEPRECATED?: LexicalEditor | null
    readOnly?: boolean
    namespace?: string
    nodes?: LexicalNode[]
    editorState?: EditorState | undefined
    theme?: EditorThemeClasses
    disableEvents?: boolean | undefined
    context?: unknown
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
