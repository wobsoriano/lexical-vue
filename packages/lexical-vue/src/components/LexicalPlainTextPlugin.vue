<script setup lang="ts">
import type { EditorState } from 'lexical'
import { useCanShowPlaceholder } from '../composables/useCanShowPlaceholder'
import { useEditor } from '../composables/useEditor'
import { usePlainTextSetup } from '../composables/usePlainTextSetup'
import Decorators from './LexicalDecoratedTeleports'

const props = defineProps<{
  // TODO: Remove in 0.4
  initialEditorState?: null | string | EditorState | (() => void)
}>()

const editor = useEditor()
const showPlaceholder = useCanShowPlaceholder(editor)
usePlainTextSetup(editor, props.initialEditorState)
</script>

<template>
  <slot name="contentEditable" />
  <slot v-if="showPlaceholder" name="placeholder" />
  <Decorators />
</template>
