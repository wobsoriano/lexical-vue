<script setup lang="ts" generic="TOption extends MenuOption">
import type { LexicalEditor, RangeSelection, TextNode } from 'lexical'
import { $getSelection, $isRangeSelection, $isTextNode, COMMAND_PRIORITY_LOW } from 'lexical'
import { ref, watchEffect } from 'vue'
import { useLexicalComposer } from '../../composables'
import type { MenuOption, MenuResolution } from '../LexicalMenu/shared'
import { useMenuAnchorRef } from '../LexicalMenu/shared'
import LexicalMenu from '../LexicalMenu/index.vue'
import type { TypeaheadMenuPluginProps } from './shared'

const props = withDefaults(defineProps<TypeaheadMenuPluginProps<TOption>>(), {
  commandPriority: COMMAND_PRIORITY_LOW,
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'open', payload: MenuResolution): void
  (e: 'queryChange', payload: string | null): void
  (e: 'selectOption', payload: {
    option: TOption
    textNodeContainingQuery: TextNode | null
    closeMenu: () => void
    matchingString: string
  }): void
}>()

const editor = useLexicalComposer()
const resolution = ref<MenuResolution | null>(null)

function setResolution(payload: MenuResolution | null) {
  resolution.value = payload
}

const anchorElementRef = useMenuAnchorRef(
  resolution,
  setResolution,
  props.anchorClassName,
  props.parent,
)

function closeTypeahead() {
  setResolution(null)
  if (resolution.value !== null)
    emit('close')
}

function openTypeahead(res: MenuResolution) {
  setResolution(res)
  if (resolution.value === null)
    emit('open', res)
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

function tryToPositionRange(
  leadOffset: number,
  range: Range,
  editorWindow: Window,
): boolean {
  const domSelection = editorWindow.getSelection()
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

function isSelectionOnEntityBoundary(
  editor: LexicalEditor,
  offset: number,
): boolean {
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

watchEffect((onInvalidate) => {
  const updateListener = () => {
    editor.getEditorState().read(() => {
      const editorWindow = editor._window || window
      const range = editorWindow.document.createRange()
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
        && !isSelectionOnEntityBoundary(editor, match.leadOffset)
      ) {
        const isRangePositioned = tryToPositionRange(
          match.leadOffset,
          range,
          editorWindow,
        )
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

  const removeUpdateListener = editor.registerUpdateListener(updateListener)

  onInvalidate(removeUpdateListener)
})
</script>

<template>
  <LexicalMenu
    v-if="resolution !== null && editor !== null"
    :anchor-element-ref="anchorElementRef"
    :editor="editor"
    :resolution="resolution!"
    :options="options"
    should-split-node-with-query
    :command-priority="commandPriority"
    :close="closeTypeahead"
    @select-option="$emit('selectOption', $event)"
  >
    <template #default="slotProps">
      <slot v-bind="slotProps" />
    </template>
  </LexicalMenu>
</template>
