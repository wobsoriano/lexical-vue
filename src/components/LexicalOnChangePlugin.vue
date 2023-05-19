<script setup lang="ts">
import type { EditorState, LexicalEditor } from 'lexical'
import { useEditor } from '../composables'
import { useMounted } from '../composables/useMounted'

const props = withDefaults(defineProps<{
  ignoreInitialChange?: boolean
  ignoreSelectionChange?: boolean
}>(), {
  ignoreInitialChange: true,
  ignoreSelectionChange: false,
})

const emit = defineEmits<{
  (e: 'change', editorState: EditorState, editor: LexicalEditor): void
}>()

const editor = useEditor()

useMounted(() => {
  return editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves, prevEditorState }) => {
    if (
      props.ignoreSelectionChange
        && dirtyElements.size === 0
        && dirtyLeaves.size === 0
    )
      return

    if (props.ignoreInitialChange && prevEditorState.isEmpty())
      return

    emit('change', editorState, editor)
  })
})
</script>

<template />
