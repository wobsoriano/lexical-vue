<script setup lang="ts">
import { mergeRegister } from '@lexical/utils'
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical'
import { INSERT_EMBED_COMMAND } from 'lexical-vue/LexicalAutoEmbedPlugin'
import { useLexicalComposer } from 'lexical-vue/LexicalComposer'
import { onMounted, onUnmounted, ref } from 'vue'
import { EmbedConfigs } from './AutoEmbedPlugin/embedConfigs'
import DropDown from '../ui/DropDown.vue'
import DropDownItem from '../ui/DropDownItem.vue'

const editor = useLexicalComposer()
const canUndo = ref(false)
const canRedo = ref(false)
const isBold = ref(false)
const isItalic = ref(false)
const isUnderline = ref(false)
const isStrikethrough = ref(false)

function updateToolbar() {
  const selection = $getSelection()
  if ($isRangeSelection(selection)) {
    // Update text format
    isBold.value = selection.hasFormat('bold')
    isItalic.value = selection.hasFormat('italic')
    isUnderline.value = selection.hasFormat('underline')
    isStrikethrough.value = selection.hasFormat('strikethrough')
  }
}

onMounted(() => {
  const unregister = mergeRegister(
    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(
        () => {
          updateToolbar()
        },
        { editor },
      )
    }),
    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, _newEditor) => {
        updateToolbar()
        return false
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        canUndo.value = payload
        return false
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        canRedo.value = payload
        return false
      },
      COMMAND_PRIORITY_LOW,
    ),
  )

  onUnmounted(unregister)
})
</script>

<template>
  <div class="toolbar">
    <button
      :disabled="!canUndo"
      class="toolbar-item spaced"
      aria-label="Undo"
      @click="editor.dispatchCommand(UNDO_COMMAND, undefined)"
    >
      <i class="format undo" />
    </button>
    <button
      :disabled="!canRedo"
      class="toolbar-item"
      aria-label="Redo"
      @click="editor.dispatchCommand(REDO_COMMAND, undefined)"
    >
      <i class="format redo" />
    </button>
    <div class="divider" />
    <button
      class="toolbar-item spaced" :class="[{ active: isBold }]"
      aria-label="Format Bold"
      @click="editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')"
    >
      <i class="format bold" />
    </button>
    <button
      class="toolbar-item spaced" :class="[{ active: isItalic }]"
      aria-label="Format Italics"
      @click="editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')"
    >
      <i class="format italic" />
    </button>
    <button
      class="toolbar-item spaced" :class="[{ active: isUnderline }]"
      aria-label="Format Underline"
      @click="editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')"
    >
      <i class="format underline" />
    </button>
    <button
      class="toolbar-item spaced" :class="[{ active: isStrikethrough }]"
      aria-label="Format Strikethrough"
      @click="editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')"
    >
      <i class="format strikethrough" />
    </button>
    <div class="divider" />
    <button
      class="toolbar-item spaced"
      aria-label="Left Align"
      @click="editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')"
    >
      <i class="format left-align" />
    </button>
    <button
      class="toolbar-item spaced"
      aria-label="Center Align"
      @click="editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')"
    >
      <i class="format center-align" />
    </button>
    <button
      class="toolbar-item spaced"
      aria-label="Right Align"
      @click="editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')"
    >
      <i class="format right-align" />
    </button>
    <button
      class="toolbar-item"
      aria-label="Justify Align"
      @click="editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')"
    >
      <i class="format justify-align" />
    </button>
    <div class="divider" />
    <DropDown
        button-class-name="toolbar-item spaced"
        button-label="Insert"
        button-aria-label="Insert specialized editor node"
        button-icon-class-name="icon plus"
      >
        <DropDownItem
          v-for="embedConfig in EmbedConfigs"
          :key="embedConfig.type"
          class="item"
          @click="editor.dispatchCommand(
            INSERT_EMBED_COMMAND,
            embedConfig.type,
          )"
        >
          <component :is="embedConfig.icon" />
          <span class="text">{{ embedConfig.contentName }}</span>
        </DropDownItem>
      </DropDown>
  </div>
</template>
