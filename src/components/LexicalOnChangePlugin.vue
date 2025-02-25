<script setup lang="ts">
import type { EditorState, LexicalEditor } from 'lexical'
import { watchEffect } from 'vue'
import { useLexicalComposer } from '../composables'

const props = withDefaults(defineProps<{
  ignoreInitialChange?: boolean
  ignoreSelectionChange?: boolean
  ignoreHistoryMergeTagChange?: boolean
}>(), {
  ignoreInitialChange: true,
  ignoreSelectionChange: false,
  ignoreHistoryMergeTagChange: true,
})

const emit = defineEmits<{
  (e: 'change', editorState: EditorState, editor: LexicalEditor, tags: Set<string>): void
}>()

const editor = useLexicalComposer()

watchEffect(() => {
  return editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves, prevEditorState, tags }) => {
    if (
      (props.ignoreSelectionChange && dirtyElements.size === 0 && dirtyLeaves.size === 0)
      || (props.ignoreHistoryMergeTagChange && tags.has('history-merge'))
      || (props.ignoreInitialChange && prevEditorState.isEmpty())
    ) {
      return
    }

    emit('change', editorState, editor, tags)
  })
})
</script>

<template />
