<script setup lang="ts">
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical'
import { mergeRegister } from '@lexical/utils'
import { useEditor } from 'lexical-vue'
import { ref, watchEffect } from 'vue'

const LowPriority = 1

const toolbarRef = ref<HTMLDivElement>()
const editor = useEditor()

const canUndo = ref(false)
const canRedo = ref(false)

watchEffect(() => {
  mergeRegister(editor.registerCommand(
    CAN_UNDO_COMMAND,
    (payload: boolean) => {
      canUndo.value = payload
      return false
    },
    LowPriority,
  ),
  editor.registerCommand(
    CAN_REDO_COMMAND,
    (payload: boolean) => {
      canRedo.value = payload
      return false
    },
    LowPriority,
  ))
})
</script>

<template>
  <div ref="toolbarRef" class="toolbar">
    <button :disabled="!canUndo" class="toolbar-item spaced" aria-label="Undo" @click="editor.dispatchCommand(UNDO_COMMAND)">
      <i class="format undo" />
    </button>
    <button :disabled="!canRedo" class="toolbar-item spaced" aria-label="Redo" @click="editor.dispatchCommand(REDO_COMMAND)">
      <i class="format redo" />
    </button>
    <div class="divider" />
  </div>
</template>
