<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useEditor } from '../composables/useEditor'

const root = ref<HTMLElement>()
const editor = useEditor()

onMounted(() => {
  if (root.value)
    editor.setRootElement(root.value)
})
</script>

<template>
  <div ref="root" class="editor-input" contenteditable="true" role="textbox" />
</template>
