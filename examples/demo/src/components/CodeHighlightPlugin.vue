<script setup lang="ts">
import { onMounted } from 'vue'
// @ts-expect-error: TODO: Missing types
import { registerCodeHighlighting } from '@lexical/code'
import { useEditor } from 'lexical-vue'

const editor = useEditor()

onMounted(() => {
  registerCodeHighlighting(editor)
})
</script>

<template />
