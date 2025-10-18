<script setup lang="ts">
import { registerCheckList } from '@lexical/list'
import { onMounted, onUnmounted } from 'vue'
import { useLexicalComposer } from '../composables'

const editor = useLexicalComposer()

onMounted(() => {
  const unregister = registerCheckList(editor)

  onUnmounted(unregister)
})
</script>

<template />
