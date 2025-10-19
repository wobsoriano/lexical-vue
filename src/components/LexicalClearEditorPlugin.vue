<script setup lang="ts">
import { registerClearEditor } from '@lexical/extension'
import { onMounted, onUnmounted } from 'vue'
import { useLexicalComposer } from '../composables'

const emit = defineEmits<{
  (e: 'clear'): void
}>()
const editor = useLexicalComposer()

onMounted(() => {
  const unregister = registerClearEditor(editor, () => {
    emit('clear')
  })

  onUnmounted(unregister)
})
</script>

<template />
