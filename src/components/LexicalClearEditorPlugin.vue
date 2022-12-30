<script setup lang="ts">
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  CLEAR_EDITOR_COMMAND,
  COMMAND_PRIORITY_EDITOR,
} from 'lexical'
import { getCurrentInstance, onMounted, onUnmounted } from 'vue'
import { useEditor } from '../composables/useEditor'

const emit = defineEmits<{
  (e: 'clear'): void
}>()
const editor = useEditor()

onMounted(() => {
  const instance = getCurrentInstance()
  const emitExists = Boolean(instance?.attrs?.onClear)

  const unregisterListener = editor.registerCommand(
    CLEAR_EDITOR_COMMAND,
    (_payload) => {
      editor.update(() => {
        if (emitExists) {
          const root = $getRoot()
          const selection = $getSelection()
          const paragraph = $createParagraphNode()
          root.clear()
          root.append(paragraph)
          if (selection !== null)
            paragraph.select()
        }
        else {
          emit('clear')
        }
      })
      return true
    },
    COMMAND_PRIORITY_EDITOR,
  )

  onUnmounted(unregisterListener)
})
</script>

<template />
