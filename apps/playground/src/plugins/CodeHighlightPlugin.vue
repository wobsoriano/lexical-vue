<script setup lang="ts">
import { registerCodeHighlighting } from '@lexical/code'
import { useLexicalComposer } from 'lexical-vue/LexicalComposer'
import { onMounted, onUnmounted } from 'vue'

const editor = useLexicalComposer()
let unregisterListener: () => void

onMounted(() => {
  unregisterListener = registerCodeHighlighting(editor)
})

onUnmounted(() => {
  unregisterListener?.()
})
</script>

<template />
