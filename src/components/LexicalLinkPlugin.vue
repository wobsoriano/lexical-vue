<script setup lang="ts">
import {
  LinkNode,
  TOGGLE_LINK_COMMAND,
  toggleLink,
} from '@lexical/link'
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  PASTE_COMMAND,
} from 'lexical'
import invariant from 'tiny-invariant'
import { mergeRegister } from '@lexical/utils'
import { useLexicalComposer } from '../composables'
import { useMounted } from '../composables/useMounted'

const props = defineProps<{
  validateUrl?: (url: string) => boolean
}>()
const editor = useLexicalComposer()
useMounted(() => {
  if (!editor.hasNodes([LinkNode]))
    invariant(false, 'LinkPlugin: LinkNode not registered on editor')

  return mergeRegister(
    editor.registerCommand(
      TOGGLE_LINK_COMMAND,
      (payload) => {
        if (payload === null) {
          toggleLink(payload)
          return true
        }
        else if (typeof payload === 'string') {
          if (props.validateUrl === undefined || props.validateUrl(payload)) {
            toggleLink(payload)
            return true
          }
          return false
        }
        else {
          const { url, target, rel, title } = payload
          toggleLink(url, { rel, target, title })
          return true
        }
      },
      COMMAND_PRIORITY_LOW,
    ),
    props.validateUrl !== undefined
      ? editor.registerCommand(
        PASTE_COMMAND,
        (event) => {
          const selection = $getSelection()
          if (
            !$isRangeSelection(selection)
            || selection.isCollapsed()
            || !(event instanceof ClipboardEvent)
            || event.clipboardData == null
          )
            return false

          const clipboardText = event.clipboardData.getData('text')
          if (!props.validateUrl?.(clipboardText))
            return false

          // If we select nodes that are elements then avoid applying the link.
          if (!selection.getNodes().some(node => $isElementNode(node))) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, clipboardText)
            event.preventDefault()
            return true
          }
          return false
        },
        COMMAND_PRIORITY_LOW,
      )
      : () => {
          // Don't paste arbritrary text as a link when there's no validate function
        },
  )
})
</script>

<template />
