<script setup lang="ts">
import { namedSignals } from '@lexical/extension'
import { watchEffect } from 'vue'
import { registerClickableLink } from '@lexical/link'
import { useLexicalComposer } from '../composables'

const props = withDefaults(defineProps<{
  newTab?: boolean
  disabled?: boolean
}>(), {
  newTab: true,
  disabled: false,
})

const editor = useLexicalComposer()

watchEffect((onInvalidate) => {
  const unregister = registerClickableLink(editor, namedSignals({ disabled: props.disabled, newTab: props.newTab }))

  onInvalidate(unregister)
})
</script>

<template />
