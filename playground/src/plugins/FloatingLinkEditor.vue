<script setup lang="ts">
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { $findMatchingParent, mergeRegister } from '@lexical/utils'
import type { BaseSelection, CommandListenerPriority } from 'lexical'
import { $getSelection, $isRangeSelection, SELECTION_CHANGE_COMMAND } from 'lexical'
import { useLexicalComposer } from 'lexical-vue'
import { onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { getSelectedNode } from '../utils/getSelectedNode'

const props = defineProps<{
  priority: CommandListenerPriority
}>()
const editorRef = ref<HTMLDivElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const mouseDownRef = ref(false)
const linkUrl = ref('')
const isEditMode = ref(false)
const lastSelection = ref<BaseSelection | null>(null)

const editor = useLexicalComposer()

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

function $updateLinkEditor() {
  const selection = $getSelection()
  if ($isRangeSelection(selection)) {
    const node = getSelectedNode(selection)
    const linkParent = $findMatchingParent(node, $isLinkNode)

    if (linkParent)
      linkUrl.value = linkParent.getURL()
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
    && editor.isEditable()
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
        $updateLinkEditor()
      })
    }),

    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        $updateLinkEditor()
        return true
      },
      props.priority,
    ),
  )
})

onMounted(() => {
  editor.getEditorState().read(() => {
    $updateLinkEditor()
  })
})

watchEffect(() => {
  if (isEditMode.value && inputRef.value)
    inputRef.value.focus()
})

onUnmounted(() => {
  unregisterListener?.()
})

function onMouseDown(e: MouseEvent) {
  e.preventDefault()
}

function onEnter() {
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
