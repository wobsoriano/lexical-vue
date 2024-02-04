<script setup lang="ts">
import { useLexicalComposer } from 'lexical-vue'
import { $insertNodeToNearestRoot } from '@lexical/utils'
import { COMMAND_PRIORITY_EDITOR } from 'lexical'

import { onMounted, onUnmounted } from 'vue'
import { INSERT_YOUTUBE_COMMAND } from './shared'
import { $createYouTubeNode, YouTubeNode } from '@/nodes/YouTubeNode'

const editor = useLexicalComposer()

onMounted(() => {
  if (!editor.hasNodes([YouTubeNode]))
    throw new Error('YouTubePlugin: YouTubeNode not registered on editor')

  const unregister = editor.registerCommand<string>(
    INSERT_YOUTUBE_COMMAND,
    (payload) => {
      const youTubeNode = $createYouTubeNode(payload)
      $insertNodeToNearestRoot(youTubeNode)

      return true
    },
    COMMAND_PRIORITY_EDITOR,
  )

  onUnmounted(() => {
    unregister()
  })
})
</script>

<template />
