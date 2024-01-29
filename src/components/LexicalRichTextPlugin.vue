<script setup lang="ts">
import { useCanShowPlaceholder, useLexicalComposer, useRichTextSetup } from '../composables'
import Decorators from './LexicalDecoratedTeleports'

const editor = useLexicalComposer()
const showPlaceholder = useCanShowPlaceholder(editor)
useRichTextSetup(editor)
</script>

<template>
  <slot name="contentEditable" />
  <slot v-if="showPlaceholder" name="placeholder" />
  <Decorators />
</template>
