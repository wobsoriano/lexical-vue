<script setup lang="ts">
import { onMounted, onUnmounted, provide, ref } from 'vue'
import * as lexicalDragon from '@lexical/dragon'
import { registerPlainText } from '@lexical/plain-text'
import { mergeRegister } from '@lexical/utils'
import type { EditorConfig } from 'lexical'
import { createEditor } from 'lexical'
import { editorKey } from '../composables/inject'

const props = defineProps<{
  initialConfig: EditorConfig<Record<string, unknown>>
}>()

// @ts-expect-error TODO: Missing generics
const editor = createEditor(props.initialConfig)

provide(editorKey, editor)

onMounted(() => {
// @ts-expect-error TODO: Missing generics
  const isReadOnly = props.initialConfig.readOnly as boolean

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
