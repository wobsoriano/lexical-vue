<script setup lang="ts">
import { ListItemNode, ListNode } from '@lexical/list'
import { onMounted } from 'vue'
import { useLexicalComposer, useList } from '../composables'

const editor = useLexicalComposer()
onMounted(() => {
  if (!editor.hasNodes([ListNode, ListItemNode])) {
    throw new Error(
      'ListPlugin: ListNode and/or ListItemNode not registered on editor',
    )
  }
})

useList(editor)
</script>

<template />
