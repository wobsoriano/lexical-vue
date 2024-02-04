<script setup lang="ts">
import type { CommandListenerPriority, RangeSelection } from 'lexical'
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $selectAll,
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
import { $getNearestBlockElementAncestorOrThrow, $getNearestNodeOfType, mergeRegister } from '@lexical/utils'
import { $isDecoratorBlockNode, INSERT_EMBED_COMMAND, useLexicalComposer } from 'lexical-vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { $isListNode, ListNode } from '@lexical/list'
import { $isHeadingNode } from '@lexical/rich-text'
import {
  $isCodeNode,
  getCodeLanguages,
  getDefaultCodeLanguage,
} from '@lexical/code'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { getSelectedNode } from '../utils/getSelectedNode'
import CodeLanguageSelect from '../components/CodeLanguageSelect.vue'
import Divider from '../components/Divider'
import BlockFormatDropDown from '../components/BlockFormatDropDown.vue'
import DropDown from '../ui/DropDown.vue'
import DropDownItem from '../ui/DropDownItem.vue'
import { dropDownActiveClass } from '../utils/other'
import FontDropDown from '../components/FontDropDown.vue'
import FloatingLinkEditor from './FloatingLinkEditor.vue'
import { EmbedConfigs } from './AutoEmbedPlugin'

const LowPriority: CommandListenerPriority = 1

const toolbarRef = ref<HTMLDivElement | null>(null)
const editor = useLexicalComposer()

const canUndo = ref(false)
const canRedo = ref(false)
const blockType = ref('paragraph')
const selectedElementKey = ref()
const codeLanguage = ref('')
const isRTL = ref(false)
const fontFamily = ref<string>('Arial')
const isLink = ref(false)
const isBold = ref(false)
const isItalic = ref(false)
const isUnderline = ref(false)
const isStrikethrough = ref(false)

const isSubscript = ref(false)
const isSuperscript = ref(false)
const isCode = ref(false)

function updateToolbar() {
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

onMounted(() => {
  const unregisterMergeListener = mergeRegister(
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
    ),
    editor.registerCommand(
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
    ),
  )

  onUnmounted(() => {
    unregisterMergeListener?.()
  })
})

const codeLanguages = getCodeLanguages() as string[]

function insertLink() {
  if (!isLink.value)
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://')

  else
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
}

function clearFormatting() {
  editor.update(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      $selectAll()
      selection.getNodes().forEach((node) => {
        if ($isTextNode(node)) {
          node.setFormat(0)
          node.setStyle('')
          $getNearestBlockElementAncestorOrThrow(node).setFormat('')
        }
        if ($isDecoratorBlockNode(node))
          node.setFormat('')
      })
    }
  })
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
    <BlockFormatDropDown
      :block-type="blockType as any"
      :editor="editor"
    />
    <Divider />
    <CodeLanguageSelect v-if="blockType === 'code'" v-model="codeLanguage" :code-languages="codeLanguages" />
    <template v-else>
      <FontDropDown
        :disabled="false"
        custom-style="font-family"
        :value="fontFamily"
        :editor="editor"
      />
      <Divider />
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
      <DropDown
        button-class-name="toolbar-item spaced"
        button-label=""
        button-aria-label="Formatting options for additional text styles"
        button-icon-class-name="icon dropdown-more"
      >
        <DropDownItem
          :class="`item ${dropDownActiveClass(isStrikethrough)}`"
          title="Strikethrough"
          aria-label="Format text with a strikethrough"
          @click="editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')"
        >
          <i class="icon strikethrough" />
          <span class="text">Strikethrough</span>
        </DropDownItem>
        <DropDownItem
          :class="`item ${dropDownActiveClass(isSubscript)}`"
          title="Strikethrough"
          aria-label="Format text with a subscript"
          @click="editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')"
        >
          <i class="icon subscript" />
          <span class="text">Subscript</span>
        </DropDownItem>
        <DropDownItem
          :class="`item ${dropDownActiveClass(isSuperscript)}`"
          title="Strikethrough"
          aria-label="Format text with a superscript"
          @click="editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')"
        >
          <i class="icon superscript" />
          <span class="text">Superscript</span>
        </DropDownItem>
        <DropDownItem
          :class="`item ${dropDownActiveClass(isSuperscript)}`"
          title="Clear text formatting"
          aria-label="Clear all text formatting"
          @click="clearFormatting"
        >
          <i class="icon clear" />
          <span class="text">Clear Formatting</span>
        </DropDownItem>
      </DropDown>
      <Divider />
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
    </template>
  </div>
</template>
