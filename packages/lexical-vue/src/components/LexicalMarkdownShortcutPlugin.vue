<script lang="ts" setup>
import { TRANSFORMERS, registerMarkdownShortcuts } from '@lexical/markdown'
import type { LexicalNode } from 'lexical'
import type { ElementTransformer, Transformer } from '@lexical/markdown'
import { onUnmounted, watchEffect } from 'vue'
import { useEditor } from '../composables/useEditor'

const DEFAULT_TRANSFORMERS = [...TRANSFORMERS]

const props = defineProps<{
  transformers?: Transformer[]
}>()
const editor = useEditor()
let unregisterListener: () => void
watchEffect((onInvalidate) => {
  unregisterListener = registerMarkdownShortcuts(editor, props.transformers)
  onInvalidate(() => {
    unregisterListener()
  })
})

onUnmounted(() => {
  unregisterListener?.()
})
</script>
<template>

</template>
<style scoped>

</style>
