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
        <i className="chevron-down" />
      </button>
    </template>
  </div>
</template>
