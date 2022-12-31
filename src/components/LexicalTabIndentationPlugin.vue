<script setup lang="ts">
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  INDENT_CONTENT_COMMAND,
  KEY_TAB_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from 'lexical'
import { onMounted, onUnmounted } from 'vue'
import { useEditor } from '../composables'

const editor = useEditor()

onMounted(() => {
  const unregisterListener = editor.registerCommand<KeyboardEvent>(
    KEY_TAB_COMMAND,
    (event) => {
      const selection = $getSelection()

      if (!$isRangeSelection(selection))
        return false

      event.preventDefault()

      return editor.dispatchCommand(
        event.shiftKey ? OUTDENT_CONTENT_COMMAND : INDENT_CONTENT_COMMAND,
        undefined,
      )
    },
    COMMAND_PRIORITY_EDITOR,
  )

  onUnmounted(() => {
    unregisterListener()
  })
})
</script>

<template />
