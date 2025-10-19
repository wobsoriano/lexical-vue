<script setup lang="ts">
import { watchEffect } from 'vue'
import { registerTabIndentation } from '@lexical/extension'
import { useLexicalComposer } from '../composables'

const props = defineProps<{
  maxIndent?: number
}>()

const editor = useLexicalComposer()

watchEffect((onInvalidate) => {
  const unregister = registerTabIndentation(editor, props.maxIndent)

  onInvalidate(unregister)
})
</script>

<template />
