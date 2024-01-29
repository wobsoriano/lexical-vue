<script setup lang="ts">
import { useCanShowPlaceholder, useLexicalComposer, usePlainTextSetup } from '../composables'
import Decorators from './LexicalDecoratedTeleports'

const editor = useLexicalComposer()
const showPlaceholder = useCanShowPlaceholder(editor)
usePlainTextSetup(editor)
</script>

<template>
  <slot v-if="showPlaceholder" name="placeholder" />
  <slot name="contentEditable" />
  <Decorators />
</template>
