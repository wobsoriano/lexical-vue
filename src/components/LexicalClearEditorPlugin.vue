<script setup lang="ts">
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  CLEAR_EDITOR_COMMAND,
  COMMAND_PRIORITY_EDITOR,
} from 'lexical'
import { useAttrs } from 'vue'
import { useLexicalComposer } from '../composables'
import { useMounted } from '../composables/useMounted'

const emit = defineEmits<{
  (e: 'clear'): void
}>()
const editor = useLexicalComposer()
const attrs = useAttrs()

useMounted(() => {
  const emitExists = Boolean(attrs.onClear)

  return editor.registerCommand(
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
})
</script>

<template />
