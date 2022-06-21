<script lang="ts" setup>
import { TRANSFORMERS, registerMarkdownShortcuts } from '@lexical/markdown'
import type { Transformer } from '@lexical/markdown'
import { defineProps, onUnmounted, watchEffect } from 'vue'
import { useEditor } from '../composables/useEditor'

const props = withDefaults(defineProps<{
  transformers?: Transformer[]
}>(), {
  transformers: () => [...TRANSFORMERS],
})
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
<template />
