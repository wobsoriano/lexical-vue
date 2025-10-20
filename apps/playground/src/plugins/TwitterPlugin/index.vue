<script setup lang="ts">
import { $insertNodeToNearestRoot } from '@lexical/utils'
import { COMMAND_PRIORITY_EDITOR } from 'lexical'
import { useLexicalComposer } from 'lexical-vue'

import { onMounted, onUnmounted } from 'vue'
import { $createTweetNode, TweetNode } from '@/nodes/TweetNode'
import { INSERT_TWEET_COMMAND } from './shared'

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
