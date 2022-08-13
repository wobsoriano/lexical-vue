<script setup lang="ts">
import {
  LinkNode,
  TOGGLE_LINK_COMMAND,
  toggleLink,
} from '@lexical/link'
import {
  COMMAND_PRIORITY_EDITOR,
} from 'lexical'
import { onMounted, onUnmounted } from 'vue'
import { useEditor } from '../composables/useEditor'

const editor = useEditor()
let unregisterListener: () => void

onMounted(() => {
  if (!editor.hasNodes([LinkNode]))
    throw new Error('LinkPlugin: LinkNode not registered on editor')

  unregisterListener = editor.registerCommand(
    TOGGLE_LINK_COMMAND,
    (payload) => {
      if (typeof payload === 'string' || payload === null) {
        toggleLink(payload)
      }
      else {
        const { url, target, rel } = payload
        toggleLink(url, { rel, target })
      }
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
