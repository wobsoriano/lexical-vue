<script setup lang="ts">
import type { EditorState } from 'lexical'
import { useCanShowPlaceholder } from '../composables/useCanShowPlaceholder'
import { useEditor } from '../composables/useEditor'
import { useRichTextSetup } from '../composables/useRichTextSetup'
import Decorators from './LexicalDecoratedTeleports'

const editor = useEditor()
const showPlaceholder = useCanShowPlaceholder(editor)
useRichTextSetup(editor)
</script>

<template>
  <slot name="contentEditable" />
  <slot v-if="showPlaceholder" name="placeholder" />
  <Decorators />
</template>
