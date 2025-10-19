<script setup lang="ts">
import type { LinkAttributes } from '@lexical/link'
import {
  LinkNode,
  registerLink,
} from '@lexical/link'

import { watchEffect } from 'vue'
import { namedSignals } from '@lexical/extension'
import { useLexicalComposer } from '../composables'

interface Props {
  validateUrl?: (url: string) => boolean
  attributes?: LinkAttributes
}

const props = defineProps<Props>()
const editor = useLexicalComposer()

watchEffect((onInvalidate) => {
  if (!editor.hasNodes([LinkNode]))
    throw new Error('LinkPlugin: LinkNode not registered on editor')

  const unregister = registerLink(editor, namedSignals({ attributes: props.attributes, validateUrl: props.validateUrl }))

  onInvalidate(unregister)
})
</script>

<template />
