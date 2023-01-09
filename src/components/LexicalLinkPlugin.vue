<script setup lang="ts">
import {
  LinkNode,
  TOGGLE_LINK_COMMAND,
  toggleLink,
} from '@lexical/link'
import {
  COMMAND_PRIORITY_EDITOR,
} from 'lexical'
import { useEditor } from '../composables'
import { useMounted } from '../composables/useMounted'

const editor = useEditor()

useMounted(() => {
  if (!editor.hasNodes([LinkNode]))
    throw new Error('LinkPlugin: LinkNode not registered on editor')

  return editor.registerCommand(
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
</script>

<template />
