<script setup lang="ts">
import { useCanShowPlaceholder, useEditor, useRichTextSetup } from '../composables'
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
