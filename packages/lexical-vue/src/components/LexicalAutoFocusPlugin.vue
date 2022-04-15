<script setup lang="ts">
import { onMounted } from 'vue'
import { useEditor } from '../composables/useEditor'

const editor = useEditor()

onMounted(() => {
  editor.focus()
})
</script>

<template>
  <slot />
</template>
