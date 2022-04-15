<script setup lang="ts">
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical'
import { useEditor } from 'lexical-vue'
import { ref } from 'vue'

const toolbarRef = ref<HTMLDivElement>()
const editor = useEditor()
</script>

<template>
  <div ref="toolbarRef" class="toolbar">
    <button class="toolbar-item spaced" aria-label="Undo" @click="editor.dispatchCommand(UNDO_COMMAND)">
      <i class="format undo" />
    </button>
    <button class="toolbar-item spaced" aria-label="Redo" @click="editor.dispatchCommand(REDO_COMMAND)">
      <i class="format redo" />
    </button>
    <div class="divider" />
  </div>
</template>
