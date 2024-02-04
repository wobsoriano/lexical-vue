<script setup lang="ts">
import { useLexicalComposer } from '../../composables'
import { type LinkMatcher, useAutoLink } from './shared'

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
