<script setup lang="ts">
import { onMounted, onUnmounted, provide, ref } from 'vue'
import type { EditorThemeClasses, LexicalEditor, LexicalNode } from 'lexical'
import * as lexicalDragon from '@lexical/dragon'
import { registerPlainText } from '@lexical/plain-text'
import { mergeRegister } from '@lexical/utils'
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

  mergeRegister(
    registerPlainText(editor),
    // @ts-expect-error: Lexical dragon esm when?
    lexicalDragon.registerDragonSupport(editor),
  )

  editor.setReadOnly(isReadOnly || false)
})
</script>

<template>
  <slot />
</template>
