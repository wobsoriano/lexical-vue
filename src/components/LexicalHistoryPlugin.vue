<script setup lang="ts">
import type { HistoryState } from '@lexical/history'
import { useHistory, useLexicalComposer } from '../composables'

const props = defineProps<{
  externalHistoryState?: HistoryState
}>()

const editor = useLexicalComposer()
useHistory(editor, props.externalHistoryState)
</script>

<template />
