<script setup lang="ts">
import { useCanShowPlaceholder } from '../composables/useCanShowPlaceholder'
import { useEditor } from '../composables/useEditor'
import { usePlainTextSetup } from '../composables/usePlainTextSetup'
import Decorators from './LexicalDecoratedTeleports'

const editor = useEditor()
const showPlaceholder = useCanShowPlaceholder(editor)
usePlainTextSetup(editor)
</script>

<template>
  <slot name="contentEditable" />
  <slot v-if="showPlaceholder" name="placeholder" />
  <Decorators />
</template>
