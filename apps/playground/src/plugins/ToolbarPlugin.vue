<script setup lang="ts">
import { useLexicalComposer } from 'lexical-vue/LexicalComposer';
import { mergeRegister } from '@lexical/utils';
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
} from 'lexical';
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue';

const editor = useLexicalComposer();
const toolbarRef = useTemplateRef('toolbarRef');
const canUndo = ref(false);
const canRedo = ref(false);
const isBold = ref(false);
const isItalic = ref(false);
const isUnderline = ref(false);
const isStrikethrough = ref(false);

const updateToolbar = () => {
  const selection = $getSelection();
  if ($isRangeSelection(selection)) {
    // Update text format
    isBold.value = selection.hasFormat('bold');
    isItalic.value = selection.hasFormat('italic');
    isUnderline.value = selection.hasFormat('underline');
    isStrikethrough.value = selection.hasFormat('strikethrough');
  }
};

onMounted(() => {
  const unregister = mergeRegister(
    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(
        () => {
          updateToolbar();
        },
        { editor },
      );
    }),
    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, _newEditor) => {
        updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        canUndo.value = payload;
        return false;
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        canRedo.value = payload;
        return false;
      },
      COMMAND_PRIORITY_LOW,
    ),
  );

  onUnmounted(unregister);
});
</script>

<template>
  <div class="toolbar" ref="toolbarRef">
    <button
      :disabled="!canUndo"
      @click="editor.dispatchCommand(UNDO_COMMAND, undefined)"
      class="toolbar-item spaced"
      aria-label="Undo">
      <i class="format undo" />
    </button>
    <button
      :disabled="!canRedo"
      @click="editor.dispatchCommand(REDO_COMMAND, undefined)"
      class="toolbar-item"
      aria-label="Redo">
      <i class="format redo" />
    </button>
    <div class="divider" />
    <button
      @click="editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')"
      :class="['toolbar-item spaced', { active: isBold }]"
      aria-label="Format Bold">
      <i class="format bold" />
    </button>
    <button
      @click="editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')"
      :class="['toolbar-item spaced', { active: isItalic }]"
      aria-label="Format Italics">
      <i class="format italic" />
    </button>
    <button
      @click="editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')"
      :class="['toolbar-item spaced', { active: isUnderline }]"
      aria-label="Format Underline">
      <i class="format underline" />
    </button>
    <button
      @click="editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')"
      :class="['toolbar-item spaced', { active: isStrikethrough }]"
      aria-label="Format Strikethrough">
      <i class="format strikethrough" />
    </button>
    <div class="divider" />
    <button
      @click="editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')"
      class="toolbar-item spaced"
      aria-label="Left Align">
      <i class="format left-align" />
    </button>
    <button
      @click="editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')"
      class="toolbar-item spaced"
      aria-label="Center Align">
      <i class="format center-align" />
    </button>
    <button
      @click="editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')"
      class="toolbar-item spaced"
      aria-label="Right Align">
      <i class="format right-align" />
    </button>
    <button
      @click="editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')"
      class="toolbar-item"
      aria-label="Justify Align">
      <i class="format justify-align" />
    </button>
  </div>
</template>