<script setup lang="ts">
import type { EditorState } from 'lexical'
import { useCanShowPlaceholder } from '../composables/useCanShowPlaceholder'
import { useEditor } from '../composables/useEditor'
import { useRichTextSetup } from '../composables/useRichTextSetup'

const props = defineProps<{
  initialEditorState?: null | string | EditorState | (() => void)
}>()

const editor = useEditor()
const showPlaceholder = useCanShowPlaceholder(editor)
useRichTextSetup(editor, props.initialEditorState)
</script>

<template>
  <slot name="contentEditable" />
  <slot v-if="showPlaceholder" name="placeholder" />
  <!-- <slot name="decorators"></slot> -->
</template>
