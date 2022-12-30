<script setup lang="ts">
import type { LinkNode } from '@lexical/link'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { mergeRegister } from '@lexical/utils'
import type { CommandListenerPriority, GridSelection, LexicalNode, NodeSelection, RangeSelection } from 'lexical'
import { $getSelection, $isRangeSelection, SELECTION_CHANGE_COMMAND } from 'lexical'
import { useEditor } from 'lexical-vue'
import { onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { getSelectedNode } from '../utils'

const props = defineProps<{
  priority: CommandListenerPriority
}>()
const editorRef = ref<HTMLDivElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const mouseDownRef = ref(false)
const linkUrl = ref('')
const isEditMode = ref(false)
const lastSelection = ref<RangeSelection | NodeSelection | GridSelection | null>(null)

const editor = useEditor()

function positionEditorElement(editor: HTMLDivElement, rect: DOMRect | null) {
  if (!rect) {
    editor.style.opacity = '0'
    editor.style.top = '-1000px'
    editor.style.left = '-1000px'
  }
  else {
    editor.style.opacity = '1'
    editor.style.top = `${rect.top + rect.height + window.pageYOffset + 10}px`
    editor.style.left = `${
      rect.left + window.pageXOffset - editor.offsetWidth / 2 + rect.width / 2
    }px`
  }
}

const updateLinkEditor = () => {
  const selection = $getSelection()
  if ($isRangeSelection(selection)) {
    const node = getSelectedNode(selection as RangeSelection)
    const parent = node.getParent() as LexicalNode | LinkNode | null
    if ($isLinkNode(parent as LexicalNode))
      linkUrl.value = (parent as LinkNode).getURL()

    else if ($isLinkNode(node))
      linkUrl.value = node.getURL()

    else
      linkUrl.value = ''
  }
  const editorElem = editorRef.value
  const nativeSelection = window.getSelection()
  const activeElement = document.activeElement

  if (!editorElem)
    return

  const rootElement = editor.getRootElement()
  if (
    selection !== null
      && !nativeSelection?.isCollapsed
      && rootElement !== null
      && rootElement.contains(nativeSelection!.anchorNode)
  ) {
    const domRange = nativeSelection?.getRangeAt(0)
    let rect
    if (nativeSelection?.anchorNode === rootElement) {
      let inner = rootElement
      while (inner.firstElementChild !== null) {
        // @ts-expect-error: TODO: Internal types
        inner = inner.firstElementChild
      }

      rect = inner.getBoundingClientRect()
    }
    else {
      rect = domRange!.getBoundingClientRect()
    }

    if (!mouseDownRef.value)
      positionEditorElement(editorElem, rect)

    lastSelection.value = selection
  }
  else if (!activeElement || activeElement.className !== 'link-input') {
    positionEditorElement(editorElem, null)
    lastSelection.value = null
    isEditMode.value = false
    linkUrl.value = ''
  }

  return true
}

let unregisterListener: () => void

onMounted(() => {
  unregisterListener = mergeRegister(
    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateLinkEditor()
      })
    }),

    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateLinkEditor()
        return true
      },
      props.priority,
    ),
  )
})

onMounted(() => {
  editor.getEditorState().read(() => {
    updateLinkEditor()
  })
})

watchEffect(() => {
  if (isEditMode.value && inputRef.value)
    inputRef.value.focus()
})

onUnmounted(() => {
  unregisterListener?.()
})

const onMouseDown = (e: MouseEvent) => {
  e.preventDefault()
}

const onEnter = () => {
  if (lastSelection.value !== null) {
    if (linkUrl.value !== '')
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl.value)

    isEditMode.value = false
  }
}
</script>

<template>
  <div ref="editorRef" class="link-editor">
    <input
      v-if="isEditMode"
      ref="inputRef"
      v-model="linkUrl"
      class="link-input"
      type="text"
      @keydown.esc.prevent="isEditMode = false"
      @keydown.enter.prevent="onEnter"
    >
    <div v-else class="link-input">
      <a :href="linkUrl" target="_BLANK" rel="noopener noreferrer">{{ linkUrl }}</a>
      <div
        class="link-edit"
        role="button"
        tabIndex="0"
        @mousedown="onMouseDown"
        @click="isEditMode = true"
      />
    </div>
  </div>
</template>
