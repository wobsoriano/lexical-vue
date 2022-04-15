<script setup lang="ts">
import { REDO_COMMAND, UNDO_COMMAND } from 'lexical'
import { useEditor } from 'lexical-vue'

const editor = useEditor()
</script>

<template>
  <button @click="editor.dispatchCommand(UNDO_COMMAND)">
    Undo
  </button>
  <button @click="editor.dispatchCommand(REDO_COMMAND)">
    Redo
  </button>
</template>
