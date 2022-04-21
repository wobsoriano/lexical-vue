<script setup lang="ts">
import {
  $createLinkNode,
  $isLinkNode,
  LinkNode,
  TOGGLE_LINK_COMMAND,
} from '@lexical/link'
import {
  $getSelection,
  $isElementNode,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
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
          firstNode.setURL(url)
          return
        }
        else {
          const parent = firstNode.getParent()
          if ($isLinkNode(parent)) {
            // set parent to be the current linkNode
            // so that other nodes in the same parent
            // aren't handled separately below.
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
          parent === linkNode
          || !parent
          || ($isElementNode(node) && !node.isInline())
        )
          return

        if (!parent.is(prevParent)) {
          // @ts-expect-error: TODO: Internal lexical types
          prevParent = parent
          linkNode = $createLinkNode(url)
          if ($isLinkNode(parent)) {
            if (!node.getPreviousSibling())
              parent.insertBefore(linkNode)

            else
              parent.insertAfter(linkNode)
          }
          else {
            node.insertBefore(linkNode)
          }
        }
        if ($isLinkNode(node)) {
          if (linkNode) {
            const children = node.getChildren()
            for (let i = 0; i < children.length; i++)
              linkNode.append(children[i])
          }
          node.remove()
          return
        }
        if (linkNode)
          linkNode.append(node)
      })
    }
  }
}

const editor = useEditor()
let unregisterListener: () => void

onMounted(() => {
  if (!editor.hasNodes([LinkNode]))
    throw new Error('LinkPlugin: LinkNode not registered on editor')

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
