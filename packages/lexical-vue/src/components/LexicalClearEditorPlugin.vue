<script setup lang="ts">
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  CLEAR_EDITOR_COMMAND,
} from 'lexical'
import { getCurrentInstance, onBeforeMount, onMounted, onUnmounted, ref } from 'vue'
import { COMMAND_PRIORITY_EDITOR } from '../utils'
import { useEditor } from '../composables/useEditor'

const editor = useEditor()
const emit = defineEmits<{
  (e: 'clear'): void
}>()
let unregisterListener: () => void

const emitExists = ref(false)

onBeforeMount(() => {
  const instance = getCurrentInstance()
  emitExists.value = Boolean(instance?.attrs?.onClear)
})

onMounted(() => {
  unregisterListener = editor.registerCommand(
    CLEAR_EDITOR_COMMAND,
    (_payload) => {
      editor.update(() => {
        if (emitExists.value) {
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

onUnmounted(() => {
  unregisterListener?.()
})
</script>

<template />
