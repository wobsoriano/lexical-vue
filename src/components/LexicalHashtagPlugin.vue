<script setup lang="ts">
import { HashtagNode, registerLexicalHashtag } from '@lexical/hashtag'
import { onMounted, onUnmounted } from 'vue'
import { useLexicalComposer } from '../composables'

const editor = useLexicalComposer()

onMounted(() => {
  if (!editor.hasNodes([HashtagNode])) {
    throw new Error('HashtagPlugin: HashtagNode not registered on editor')
  }

  const unregister = registerLexicalHashtag(editor)

  onUnmounted(unregister)
})
</script>

<template />
