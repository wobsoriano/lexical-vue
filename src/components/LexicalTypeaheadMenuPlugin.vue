<script setup lang="ts">
import type { LexicalEditor, RangeSelection, TextNode } from 'lexical'
import { $getSelection, $isRangeSelection, $isTextNode } from 'lexical'
import { ref } from 'vue'
import type { Resolution, TriggerFn, TypeaheadOption } from '../composables'
import { useEditor, useEffect, useMenuAnchorRef } from '../composables'
import LexicalPopoverMenu from './LexicalPopoverMenu.vue'

const props = defineProps<{
  anchorClassName?: string
  triggerFn: TriggerFn
  options: Array<TypeaheadOption>
}>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'open', payload: Resolution): void
  (e: 'queryChange', payload: string | null): void
  (e: 'selectOption', payload: {
    close: () => void
    option: TypeaheadOption
    textNodeContainingQuery: TextNode | null
    matchingString: string
  }): void
}>()
const editor = useEditor()
const resolution = ref<Resolution | null>(null)

function setResolution(value: Resolution | null) {
  resolution.value = value
}

const anchorElementRef = useMenuAnchorRef(
  resolution,
  setResolution,
  props.anchorClassName,
)

function closeTypeahead() {
  setResolution(null)
  if (resolution.value !== null)
    emit('close')
}

function openTypeahead(res: Resolution) {
  setResolution(res)
  if (resolution.value === null)
    emit('open', res)
}

function isSelectionOnEntityBoundary(offset: number): boolean {
  if (offset !== 0)
    return false

  return editor.getEditorState().read(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const anchor = selection.anchor
      const anchorNode = anchor.getNode()
      const prevSibling = anchorNode.getPreviousSibling()
      return $isTextNode(prevSibling) && prevSibling.isTextEntity()
    }
    return false
  })
}

function getTextUpToAnchor(selection: RangeSelection): string | null {
  const anchor = selection.anchor
  if (anchor.type !== 'text')
    return null

  const anchorNode = anchor.getNode()
  if (!anchorNode.isSimpleText())
    return null

  const anchorOffset = anchor.offset
  return anchorNode.getTextContent().slice(0, anchorOffset)
}

function tryToPositionRange(leadOffset: number, range: Range): boolean {
  const domSelection = window.getSelection()
  if (domSelection === null || !domSelection.isCollapsed)
    return false

  const anchorNode = domSelection.anchorNode
  const startOffset = leadOffset
  const endOffset = domSelection.anchorOffset

  if (anchorNode == null || endOffset == null)
    return false

  try {
    range.setStart(anchorNode, startOffset)
    range.setEnd(anchorNode, endOffset)
  }
  catch (error) {
    return false
  }

  return true
}

function getQueryTextForSearch(editor: LexicalEditor): string | null {
  let text = null
  editor.getEditorState().read(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection))
      return

    text = getTextUpToAnchor(selection)
  })
  return text
}

useEffect(() => {
  const updateListener = () => {
    editor.getEditorState().read(() => {
      const range = document.createRange()
      const selection = $getSelection()
      const text = getQueryTextForSearch(editor)

      if (
        !$isRangeSelection(selection)
          || !selection.isCollapsed()
          || text === null
          || range === null
      ) {
        closeTypeahead()
        return
      }

      const match = props.triggerFn(text, editor)
      emit('queryChange', match ? match.matchingString : null)

      if (
        match !== null
          && !isSelectionOnEntityBoundary(match.leadOffset)
      ) {
        const isRangePositioned = tryToPositionRange(match.leadOffset, range)
        if (isRangePositioned !== null) {
          openTypeahead({
            getRect: () => range.getBoundingClientRect(),
            match,
          })
          return
        }
      }
      closeTypeahead()
    })
  }

  return editor.registerUpdateListener(updateListener)
})
</script>

<template>
  <LexicalPopoverMenu
    v-if="resolution"
    :anchor-element-ref="anchorElementRef"
    :resolution="resolution"
    :options="options"
    @close="closeTypeahead"
    @select-option="$emit('selectOption', $event)"
  >
    <template #default="slotProps">
      <slot v-bind="slotProps" />
    </template>
  </LexicalPopoverMenu>
</template>
