<script setup lang="ts">
import type { HistoryState } from '@lexical/history'
import { useEditor } from '../composables/useEditor'
import { useHistory } from '../composables/useHistory'

const props = defineProps<{
  externalHistoryState?: HistoryState
}>()

const editor = useEditor()
useHistory(editor, props.externalHistoryState)
</script>

<!-- eslint-disable-next-line vue/valid-template-root -->
<template />
