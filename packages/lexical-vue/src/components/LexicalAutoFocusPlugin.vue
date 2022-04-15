<script setup lang="ts">
import { nextTick, onMounted } from 'vue'
import { useEditor } from '../composables/useEditor'

const editor = useEditor()

onMounted(() => {
  nextTick(() => {
    editor.focus()
  })
})
</script>

<template />
