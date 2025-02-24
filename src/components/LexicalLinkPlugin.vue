<script setup lang="ts">
import type { LinkAttributes } from '@lexical/link'
import {
  $toggleLink,
  LinkNode,
  TOGGLE_LINK_COMMAND,
} from '@lexical/link'
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  PASTE_COMMAND,
} from 'lexical'
import { mergeRegister, objectKlassEquals } from '@lexical/utils'
import { useEffect, useLexicalComposer } from '../composables'

interface Props {
  validateUrl?: (url: string) => boolean
  attributes?: LinkAttributes
}

const { validateUrl, attributes } = defineProps<Props>()
const editor = useLexicalComposer()

useEffect(() => {
  if (!editor.hasNodes([LinkNode]))
    throw new Error('LinkPlugin: LinkNode not registered on editor')

  return mergeRegister(
    editor.registerCommand(
      TOGGLE_LINK_COMMAND,
      (payload) => {
        if (payload === null) {
          $toggleLink(payload)
          return true
        }
        else if (typeof payload === 'string') {
          if (validateUrl === undefined || validateUrl(payload)) {
            $toggleLink(payload, attributes)
            return true
          }
          return false
        }
        else {
          const { url, target, rel, title } = payload
          $toggleLink(url, {
            ...attributes,
            rel,
            target,
            title,
          })
          return true
        }
      },
      COMMAND_PRIORITY_LOW,
    ),
    validateUrl !== undefined
      ? editor.registerCommand(
        PASTE_COMMAND,
        (event) => {
          const selection = $getSelection()
          if (
            !$isRangeSelection(selection)
            || selection.isCollapsed()
            || !objectKlassEquals(event, ClipboardEvent)
          ) {
            return false
          }

          const clipboardEvent = event as ClipboardEvent
          if (clipboardEvent.clipboardData === null)
            return false

          const clipboardText = clipboardEvent.clipboardData.getData('text')
          if (!validateUrl?.(clipboardText))
            return false

          // If we select nodes that are elements then avoid applying the link.
          if (!selection.getNodes().some(node => $isElementNode(node))) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
              ...attributes,
              url: clipboardText,
            })
            event.preventDefault()
            return true
          }
          return false
        },
        COMMAND_PRIORITY_LOW,
      )
      : () => {
          // Don't paste arbitrary text as a link when there's no validate function
        },
  )
})
</script>

<template />
