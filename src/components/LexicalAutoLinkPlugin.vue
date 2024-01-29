<script setup lang="ts">
import { type LinkMatcher, useAutoLink, useLexicalComposer } from '../composables'

const props = defineProps<{
  matchers: LinkMatcher[]
}>()

const emit = defineEmits<{
  (e: 'change', value: { url: string | null, prevUrl: string | null }): void
}>()

const editor = useLexicalComposer()

useAutoLink(editor, props.matchers, (url: string | null, prevUrl: string | null) => {
  emit('change', {
    url,
    prevUrl,
  })
})
</script>

<template />
