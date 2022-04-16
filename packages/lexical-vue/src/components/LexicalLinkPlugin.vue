<script setup lang="ts">
import type { LinkNode } from '@lexical/link'
import {
  $createLinkNode,
  $isLinkNode,
  TOGGLE_LINK_COMMAND,
} from '@lexical/link'
import {
  $getSelection,
  $isElementNode,
  $setSelection,
} from 'lexical'
import { onMounted, onUnmounted } from 'vue'
import { useEditor } from '../composables/useEditor'

function toggleLink(url?: string) {
  const selection = $getSelection()
  if (selection)
    $setSelection(selection)

  const sel = $getSelection()
  if (sel) {
    const nodes = sel.extract()
    if (!url) {
      // Remove LinkNodes
      nodes.forEach((node) => {
        const parent = node.getParent()

        if (parent && $isLinkNode(parent)) {
          const children = parent.getChildren()
          for (let i = 0; i < children.length; i++)
            parent.insertBefore(children[i])

          parent.remove()
        }
      })
    }
    else {
      // Add or merge LinkNodes
      if (nodes.length === 1) {
        const firstNode = nodes[0]
        // if the first node is a LinkNode or if its
        // parent is a LinkNode, we update the URL.
        if ($isLinkNode(firstNode)) {
          // @ts-expect-error: TODO: Internal lexical types
          firstNode.setURL(url)
          return
        }
        else {
          const parent = firstNode.getParent()
          if ($isLinkNode(parent)) {
            // set parent to be the current linkNode
            // so that other nodes in the same parent
            // aren't handled separately below.
            // @ts-expect-error: TODO: Internal lexical types
            parent.setURL(url)
            return
          }
        }
      }

      let prevParent: LinkNode
      let linkNode: LinkNode
      nodes.forEach((node) => {
        const parent = node.getParent()
        if (
        // @ts-expect-error: TODO: Internal lexical types
          parent === linkNode
          || !parent
          // @ts-expect-error: TODO: Internal lexical types
          || ($isElementNode(node) && !node.isInline())
        )
          return

        // @ts-expect-error: TODO: Internal lexical types
        if (!parent.is(prevParent)) {
          // @ts-expect-error: TODO: Internal lexical types
          prevParent = parent
          linkNode = $createLinkNode(url)
          if ($isLinkNode(parent)) {
            if (!node.getPreviousSibling()) {
              // @ts-expect-error: TODO: Internal lexical types
              parent.insertBefore(linkNode)
            }
            else {
              // @ts-expect-error: TODO: Internal lexical types
              parent.insertAfter(linkNode)
            }
          }
          else {
            // @ts-expect-error: TODO: Internal lexical types
            node.insertBefore(linkNode)
          }
        }
        if ($isLinkNode(node)) {
          if (linkNode) {
            // @ts-expect-error: TODO: Internal lexical types
            const children = node.getChildren()
            for (let i = 0; i < children.length; i++) {
              // @ts-expect-error: TODO: Internal lexical types
              linkNode.append(children[i])
            }
          }
          node.remove()
          return
        }
        if (linkNode) {
          // @ts-expect-error: TODO: Internal lexical types
          linkNode.append(node)
        }
      })
    }
  }
}

const editor = useEditor()
let unregisterListener: () => void

// TODO: Missing export
const COMMAND_PRIORITY_EDITOR = 0

onMounted(() => {
  //  TODO: Throwing getType error
  // if (!editor.hasNodes(LinkNode))
  //   throw new Error('LinkPlugin: LinkNode not registered on editor')

  unregisterListener = editor.registerCommand(
    TOGGLE_LINK_COMMAND,
    (payload: string | undefined) => {
      const url: string | undefined = payload
      toggleLink(url)
      return true
    },
    COMMAND_PRIORITY_EDITOR,
  )
})

onUnmounted(() => {
  unregisterListener?.()
})
</script>

<template />
