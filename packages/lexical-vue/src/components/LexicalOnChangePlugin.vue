<script setup lang="ts">
import { onUnmounted, watchEffect } from 'vue'
import type { EditorState, LexicalEditor } from 'lexical'
import { useEditor } from '../composables/useEditor'

const editor = useEditor()

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

watchEffect(() => {
  const unsub = editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves, prevEditorState }) => {
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

  onUnmounted(() => {
    unsub()
  })
})
</script>

<template>
  <slot />
</template>
