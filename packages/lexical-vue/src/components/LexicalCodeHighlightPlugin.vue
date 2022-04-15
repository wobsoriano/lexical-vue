<script setup lang="ts">
import { onMounted } from 'vue'
// @ts-expect-error: TODO: Types
import { registerCodeHighlighting } from '@lexical/code'
import { useEditor } from '../composables/useEditor'

const editor = useEditor()

onMounted(() => {
  registerCodeHighlighting(editor)
})
</script>

<!-- eslint-disable-next-line vue/valid-template-root -->
<template />
