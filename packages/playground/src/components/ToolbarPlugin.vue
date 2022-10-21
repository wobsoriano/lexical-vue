<script setup lang="ts">
import type { CommandListenerPriority, RangeSelection } from 'lexical'
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical'
import {
  $isParentElementRTL,
} from '@lexical/selection'
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils'
import { useEditor } from 'lexical-vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { $isListNode, ListNode } from '@lexical/list'
import { $isHeadingNode } from '@lexical/rich-text'
import {
  $isCodeNode,
  getCodeLanguages,
  getDefaultCodeLanguage,
} from '@lexical/code'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { getSelectedNode } from '../utils'
import BlockOptionsDropdownList from './BlockOptionsDropdownList.vue'
import CodeLanguageSelect from './CodeLanguageSelect.vue'
import FloatingLinkEditor from './FloatingLinkEditor.vue'
import Divider from './Divider'

const LowPriority: CommandListenerPriority = 1

const supportedBlockTypes = new Set([
  'paragraph',
  'quote',
  'code',
  'h1',
  'h2',
  'ul',
  'ol',
])

const blockTypeToBlockName: Record<string, string> = {
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

const toolbarRef = ref<HTMLDivElement | null>(null)
const editor = useEditor()

const canUndo = ref(false)
const canRedo = ref(false)
const blockType = ref('paragraph')
const selectedElementKey = ref()
const codeLanguage = ref('')
const isRTL = ref(false)
const isLink = ref(false)
const isBold = ref(false)
const isItalic = ref(false)
const isUnderline = ref(false)
const isStrikethrough = ref(false)
const isCode = ref(false)
const showBlockOptionsDropDown = ref(false)

const updateToolbar = () => {
  const selection = $getSelection() as RangeSelection
  if ($isRangeSelection(selection)) {
    const anchorNode = selection.anchor.getNode()
    const element
        = anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow()
    const elementKey = element.getKey()
    const elementDOM = editor.getElementByKey(elementKey)
    if (elementDOM !== null) {
      selectedElementKey.value = elementKey
      if ($isListNode(element)) {
        const parentList = $getNearestNodeOfType(anchorNode, ListNode) as ListNode
        blockType.value = parentList ? parentList.getTag() : (element as ListNode).getTag()
      }
      else {
        blockType.value = $isHeadingNode(element)
          // @ts-expect-error: Missing internal types
          ? (element as ListNode).getTag()
          : element.getType()
        if ($isCodeNode(element))
          codeLanguage.value = element.getLanguage() || getDefaultCodeLanguage()
      }
    }
    // Update text format
    isBold.value = selection.hasFormat('bold')
    isItalic.value = selection.hasFormat('italic')
    isUnderline.value = selection.hasFormat('underline')
    isStrikethrough.value = selection.hasFormat('strikethrough')
    isCode.value = selection.hasFormat('code')
    isRTL.value = $isParentElementRTL(selection)

    // Update links
    const node = getSelectedNode(selection)
    const parent = node.getParent()
    if ($isLinkNode(parent) || $isLinkNode(node))
      isLink.value = true
    else
      isLink.value = false
  }
}

let unregisterMergeListener: () => void

onMounted(() => {
  unregisterMergeListener = mergeRegister(
    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar()
      })
    }),
    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar()
        return false
      },
      LowPriority,
    ), editor.registerCommand(
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

const codeLanguages = getCodeLanguages() as string[]

const insertLink = () => {
  if (!isLink.value)
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://')

  else
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
}

watch(codeLanguage, (value) => {
  editor.update(() => {
    if (selectedElementKey.value) {
      const node = $getNodeByKey(selectedElementKey.value)
      if ($isCodeNode(node))
        node.setLanguage(value)
    }
  })
})

onUnmounted(() => {
  unregisterMergeListener?.()
})
</script>

<template>
  <div ref="toolbarRef" class="toolbar">
    <button :disabled="!canUndo" class="toolbar-item spaced" aria-label="Undo" @click="editor.dispatchCommand(UNDO_COMMAND, undefined)">
      <i class="format undo" />
    </button>
    <button :disabled="!canRedo" class="toolbar-item spaced" aria-label="Redo" @click="editor.dispatchCommand(REDO_COMMAND, undefined)">
      <i class="format redo" />
    </button>
    <Divider />
    <template v-if="supportedBlockTypes.has(blockType)">
      <button class="toolbar-item block-controls" aria-label="Formatting Options" @click="showBlockOptionsDropDown = !showBlockOptionsDropDown">
        <span :class="`icon block-type ${blockType}`" />
        <span class="text">{{ blockTypeToBlockName[blockType] }}</span>
        <i class="chevron-down" />
      </button>
      <Teleport to="body">
        <BlockOptionsDropdownList
          v-if="showBlockOptionsDropDown"
          v-model:showBlockOptionsDropDown="showBlockOptionsDropDown"
          :block-type="blockType"
          :toolbar-ref="toolbarRef"
        />
      </Teleport>
    </template>
    <Divider />
    <template v-if="blockType === 'code'">
      <CodeLanguageSelect v-model="codeLanguage" :code-languages="codeLanguages" />
    </template>
    <template v-else>
      <button
        :class="`toolbar-item spaced ${isBold ? 'active' : ''}`"
        aria-label="Format Bold"
        @click="editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')"
      >
        <i class="format bold" />
      </button>
      <button
        :class="`toolbar-item spaced ${isItalic ? 'active' : ''}`"
        aria-label="Format Italics"
        @click="editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')"
      >
        <i class="format italic" />
      </button>
      <button
        :class="`toolbar-item spaced ${isUnderline ? 'active' : ''}`"
        aria-label="Format Underline"
        @click="editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')"
      >
        <i class="format underline" />
      </button>
      <button
        :class="`toolbar-item spaced ${isStrikethrough ? 'active' : ''}`"
        aria-label="Format Strikethrough"
        @click="editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')"
      >
        <i class="format strikethrough" />
      </button>
      <button
        :class="`toolbar-item spaced ${isCode ? 'active' : ''}`"
        aria-label="Insert Code"
        @click="editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')"
      >
        <i class="format code" />
      </button>
      <button
        :class="`toolbar-item spaced ${isLink ? 'active' : ''}`"
        aria-label="Insert Link"
        @click="insertLink"
      >
        <i class="format link" />
      </button>
      <Teleport to="body">
        <FloatingLinkEditor v-if="isLink" :priority="LowPriority" />
      </Teleport>
      <Divider />
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
    </template>
  </div>
</template>
