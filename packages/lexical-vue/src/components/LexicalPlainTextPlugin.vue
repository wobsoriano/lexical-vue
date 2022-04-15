<script setup lang="ts">
import type { EditorState } from 'lexical'
import { useCanShowPlaceholder } from '../composables/useCanShowPlaceholder'
import { useEditor } from '../composables/useEditor'
import { usePlainTextSetup } from '../composables/usePlainTextSetup'

const props = defineProps<{
  initialEditorState?: null | string | EditorState | (() => void)
}>()

const editor = useEditor()
const showPlaceholder = useCanShowPlaceholder()
usePlainTextSetup(editor, props.initialEditorState)
</script>

<template>
  <slot name="contentEditable" />
  <slot v-if="showPlaceholder" name="placeholder" />
  <!-- <slot name="decorators"></slot> -->
</template>
