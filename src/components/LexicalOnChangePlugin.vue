<script setup lang="ts">
import { type EditorState, HISTORY_MERGE_TAG, type LexicalEditor } from 'lexical'
import { watchEffect } from 'vue'
import { useLexicalComposer } from '../composables'

const props = withDefaults(defineProps<{
  ignoreSelectionChange?: boolean
  ignoreHistoryMergeTagChange?: boolean
}>(), {
  ignoreSelectionChange: false,
  ignoreHistoryMergeTagChange: true,
})

const emit = defineEmits<{
  (e: 'change', editorState: EditorState, editor: LexicalEditor, tags: Set<string>): void
}>()

const editor = useLexicalComposer()

watchEffect((onInvalidate) => {
  const unregister = editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves, prevEditorState, tags }) => {
    if (
      (props.ignoreSelectionChange && dirtyElements.size === 0 && dirtyLeaves.size === 0)
      || (props.ignoreHistoryMergeTagChange && tags.has(HISTORY_MERGE_TAG))
      || prevEditorState.isEmpty()
    ) {
      return
    }

    emit('change', editorState, editor, tags)
  })

  onInvalidate(unregister)
})
</script>

<template />
