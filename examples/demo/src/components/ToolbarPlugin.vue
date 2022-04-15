<script setup lang="ts">
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical'
import { mergeRegister } from '@lexical/utils'
import { useEditor } from 'lexical-vue'
import { defineComponent, h, onMounted, onUnmounted, ref } from 'vue'

const LowPriority = 1

const supportedBlockTypes = new Set([
  'paragraph',
  'quote',
  'code',
  'h1',
  'h2',
  'ul',
  'ol',
])

const blockTypeToBlockName = {
  code: 'Code Block',
  h1: 'Large Heading',
  h2: 'Small Heading',
  h3: 'Heading',
  h4: 'Heading',
  h5: 'Heading',
  ol: 'Numbered List',
  paragraph: 'Normal',
  quote: 'Quote',
  ul: 'Bulleted List',
}

const toolbarRef = ref<HTMLDivElement>()
const editor = useEditor()

const canUndo = ref(false)
const canRedo = ref(false)
const blockType = ref('paragraph')
const isLink = ref(false)
const isBold = ref(false)
const isItalic = ref(false)
const isUnderline = ref(false)
const isStrikethrough = ref(false)
const isCode = ref(false)

let unregisterMergeListener: () => void

onMounted(() => {
  unregisterMergeListener = mergeRegister(editor.registerCommand(
    CAN_UNDO_COMMAND,
    (payload: boolean) => {
      canUndo.value = payload
      return false
    },
    LowPriority,
  ),
  editor.registerCommand(
    CAN_REDO_COMMAND,
    (payload: boolean) => {
      canRedo.value = payload
      return false
    },
    LowPriority,
  ))
})

onUnmounted(() => {
  unregisterMergeListener?.()
})

const Divider = defineComponent({
  render() {
    return h('div', {
      class: 'divider',
    })
  },
})
</script>

<template>
  <div ref="toolbarRef" class="toolbar">
    <button :disabled="!canUndo" class="toolbar-item spaced" aria-label="Undo" @click="editor.dispatchCommand(UNDO_COMMAND)">
      <i class="format undo" />
    </button>
    <button :disabled="!canRedo" class="toolbar-item spaced" aria-label="Redo" @click="editor.dispatchCommand(REDO_COMMAND)">
      <i class="format redo" />
    </button>
    <Divider />
    <template v-if="supportedBlockTypes.has(blockType)">
      <button class="toolbar-item block-controls" aria-label="Formatting Options">
        <span :class="`icon block-type ${blockType}`" />
        <span class="text">{{ blockTypeToBlockName[blockType] }}</span>
        <i class="chevron-down" />
      </button>
    </template>
    <Divider />
    <button
      :class="`toolbar-item spaced ${isBold ? 'active' : ''}`"
      aria-label="Format Bold"
    >
      <i class="format bold" />
    </button>
    <button
      :class="`toolbar-item spaced ${isItalic ? 'active' : ''}`"
      aria-label="Format Italics"
    >
      <i class="format italic" />
    </button>
    <button
      :class="`toolbar-item spaced ${isUnderline ? 'active' : ''}`"
      aria-label="Format Underline"
    >
      <i class="format underline" />
    </button>
    <button
      :class="`toolbar-item spaced ${isStrikethrough ? 'active' : ''}`"
      aria-label="Format Strikethrough"
    >
      <i class="format strikethrough" />
    </button>
    <button
      :class="`toolbar-item spaced ${isCode ? 'active' : ''}`"
      aria-label="Insert Code"
    >
      <i class="format code" />
    </button>
    <button
      :class="`toolbar-item spaced ${isLink ? 'active' : ''}`"
      aria-label="Insert Link"
    >
      <i class="format link" />
    </button>
    <Divider />
    <button

      class="toolbar-item spaced"
      aria-label="Left Align"
    >
      <i class="format left-align" />
    </button>
    <button
      class="toolbar-item spaced"
      aria-label="Center Align"
    >
      <i class="format center-align" />
    </button>
    <button
      class="toolbar-item spaced"
      aria-label="Right Align"
    >
      <i class="format right-align" />
    </button>
    <button
      class="toolbar-item"
      aria-label="Justify Align"
    >
      <i class="format justify-align" />
    </button>
  </div>
</template>
