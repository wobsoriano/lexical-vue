<script setup lang="ts">
import { useLexicalComposer } from 'lexical-vue'
import { $insertNodeToNearestRoot } from '@lexical/utils'
import { COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical'

import { onMounted, onUnmounted } from 'vue'
import { INSERT_TWEET_COMMAND } from './shared'
import { $createTweetNode, TweetNode } from '@/nodes/TweetNode'

const editor = useLexicalComposer()

onMounted(() => {
  if (!editor.hasNodes([TweetNode]))
    throw new Error('TwitterPlugin: TweetNode not registered on editor')

  const unregister = editor.registerCommand<string>(
    INSERT_TWEET_COMMAND,
    (payload) => {
      const tweetNode = $createTweetNode(payload)
      $insertNodeToNearestRoot(tweetNode)

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
