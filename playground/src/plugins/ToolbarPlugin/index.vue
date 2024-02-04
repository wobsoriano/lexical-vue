<script setup lang="ts">
import type { CommandListenerPriority } from 'lexical'
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  $selectAll,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_NORMAL,
  FORMAT_TEXT_COMMAND,
  KEY_MODIFIER_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical'
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText,
} from '@lexical/selection'
import { $findMatchingParent, $getNearestBlockElementAncestorOrThrow, $getNearestNodeOfType, mergeRegister } from '@lexical/utils'
import { $isDecoratorBlockNode, INSERT_EMBED_COMMAND, useLexicalComposer } from 'lexical-vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { $isListNode, ListNode } from '@lexical/list'
import { $isHeadingNode } from '@lexical/rich-text'
import {
  $isCodeNode,
  CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  CODE_LANGUAGE_MAP,
  getLanguageFriendlyName,
} from '@lexical/code'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import FloatingLinkEditor from '../FloatingLinkEditor.vue'
import { EmbedConfigs } from '../AutoEmbedPlugin/shared'
import Divider from './Divider.vue'
import BlockFormatDropDown from './BlockFormatDropDown.vue'
import FontDropDown from './FontDropDown.vue'
import { blockTypeToBlockName, dropDownActiveClass } from './shared'
import FontSize from './FontSize.vue'
import { sanitizeUrl } from '@/utils/url'
import DropDown from '@/ui/DropDown.vue'
import DropDownItem from '@/ui/DropDownItem.vue'
import { getSelectedNode } from '@/utils/getSelectedNode'
import DropdownColorPicker from '@/ui/DropdownColorPicker.vue'

const emit = defineEmits<{
  (event: 'isLinkEditMode', value: boolean): void
}>()

const LowPriority: CommandListenerPriority = 1

const toolbarRef = ref<HTMLDivElement | null>(null)
const editor = useLexicalComposer()

const fontSize = ref('15px')
const fontColor = ref<string>('#000')
const bgColor = ref<string>('#fff')
const canUndo = ref(false)
const canRedo = ref(false)
const blockType = ref<keyof typeof blockTypeToBlockName>('paragraph')
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

function $updateToolbar() {
  const selection = $getSelection()
  if ($isRangeSelection(selection)) {
    const anchorNode = selection.anchor.getNode()
    let element
        = anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
            const parent = e.getParent()
            return parent !== null && $isRootOrShadowRoot(parent)
          })

    if (element === null)
      element = anchorNode.getTopLevelElementOrThrow()

    const elementKey = element.getKey()
    const elementDOM = editor.getElementByKey(elementKey)

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

    if (elementDOM !== null) {
      selectedElementKey.value = elementKey
      if ($isListNode(element)) {
        const parentList = $getNearestNodeOfType<ListNode>(
          anchorNode,
          ListNode,
        )
        const type = parentList
          ? parentList.getListType()
          : element.getListType()
        blockType.value = type
      }
      else {
        const type = $isHeadingNode(element)
          ? element.getTag()
          : element.getType()
        if (type in blockTypeToBlockName)
          blockType.value = type as keyof typeof blockTypeToBlockName

        if ($isCodeNode(element)) {
          const language
              = element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP
          codeLanguage.value = language ? CODE_LANGUAGE_MAP[language] || language : ''
        }
      }
    }

    // Handle buttons
    fontSize.value = $getSelectionStyleValueForProperty(selection, 'font-size', '15px')
    fontColor.value = $getSelectionStyleValueForProperty(selection, 'color', '#000')
    bgColor.value = $getSelectionStyleValueForProperty(selection, 'background-color', '#fff')
    fontFamily.value = $getSelectionStyleValueForProperty(selection, 'font-family', 'Arial')

    // let matchingParent
    if ($isLinkNode(parent)) {
      // If node is a link, we need to fetch the parent paragraph node to set format
      // matchingParent = $findMatchingParent(
      //   node,
      //   parentNode => $isElementNode(parentNode) && !parentNode.isInline(),
      // )
    }

    // If matchingParent is a valid node, pass it's format type
    // elementFormat.value = $isElementNode(matchingParent)
    //       ? matchingParent.getFormatType()
    //       : $isElementNode(node)
    //       ? node.getFormatType()
    //       : parent?.getFormatType() || 'left'
  }
}

function getCodeLanguageOptions(): [string, string][] {
  const options: [string, string][] = []

  for (const [lang, friendlyName] of Object.entries(
    CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  ))
    options.push([lang, friendlyName])

  return options
}

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions()

onMounted(() => {
  const unregisterMergeListener = mergeRegister(
    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        $updateToolbar()
      })
    }),
    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        $updateToolbar()
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
    unregisterMergeListener()
  })
})

onMounted(() => {
  const unregister = editor.registerCommand(
    KEY_MODIFIER_COMMAND,
    (payload) => {
      const event: KeyboardEvent = payload
      const { code, ctrlKey, metaKey } = event

      if (code === 'KeyK' && (ctrlKey || metaKey)) {
        event.preventDefault()
        let url: string | null
        if (!isLink.value) {
          emit('isLinkEditMode', true)
          url = sanitizeUrl('https://')
        }
        else {
          emit('isLinkEditMode', false)
          url = null
        }
        return editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
      }
      return false
    },
    COMMAND_PRIORITY_NORMAL,
  )

  onUnmounted(() => {
    unregister()
  })
})

function insertLink() {
  if (!isLink.value) {
    emit('isLinkEditMode', true)
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl('https://'))
  }
  else {
    emit('isLinkEditMode', false)
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
  }
}

function applyStyleText(styles: Record<string, string>, skipHistoryStack?: boolean) {
  editor.update(
    () => {
      const selection = $getSelection()
      if (selection !== null)
        $patchStyleText(selection, styles)
    },
    skipHistoryStack ? { tag: 'historic' } : {},
  )
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

function onFontColorSelect(value: string, skipHistoryStack: boolean) {
  applyStyleText({ color: value }, skipHistoryStack)
}

function onBgColorSelect(value: string, skipHistoryStack: boolean) {
  applyStyleText({ 'background-color': value }, skipHistoryStack)
}

function onCodeLanguageSelect(value: string) {
  editor.update(() => {
    if (selectedElementKey.value !== null) {
      const node = $getNodeByKey(selectedElementKey.value)
      if ($isCodeNode(node))
        node.setLanguage(value)
    }
  })
}
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
      :block-type="blockType"
      :editor="editor"
    />
    <Divider />
    <DropDown
      v-if="blockType === 'code'"
      button-class-name="toolbar-item code-language"
      :button-label="getLanguageFriendlyName(codeLanguage)"
      button-aria-label="Select language"
    >
      <DropDownItem
        v-for="[value, name] in CODE_LANGUAGE_OPTIONS"
        :key="value" :class="`item ${dropDownActiveClass(
          value === codeLanguage,
        )}`" @click="onCodeLanguageSelect(value)"
      >
        <span class="text">{{ name }}</span>
      </DropDownItem>
    </DropDown>
    <template v-else>
      <FontDropDown
        custom-style="font-family"
        :value="fontFamily"
        :editor="editor"
      />
      <Divider />
      <FontSize
        :disabled="false"
        :editor="editor"
        :selection-font-size="fontSize.slice(0, -2)"
      />
      <Divider />
      <button
        :class="`toolbar-item spaced ${isBold ? 'active' : ''}`"
        aria-label="Format Bold"
        type="button"
        @click="editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')"
      >
        <i class="format bold" />
      </button>
      <button
        :class="`toolbar-item spaced ${isItalic ? 'active' : ''}`"
        type="button"
        aria-label="Format Italics"
        @click="editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')"
      >
        <i class="format italic" />
      </button>
      <button
        :class="`toolbar-item spaced ${isUnderline ? 'active' : ''}`"
        type="button"
        aria-label="Format Underline"
        @click="editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')"
      >
        <i class="format underline" />
      </button>
      <button
        :class="`toolbar-item spaced ${isStrikethrough ? 'active' : ''}`"
        type="button"
        aria-label="Format Strikethrough"
        @click="editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')"
      >
        <i class="format strikethrough" />
      </button>
      <button
        :class="`toolbar-item spaced ${isCode ? 'active' : ''}`"
        type="button"
        aria-label="Insert Code"
        @click="editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')"
      >
        <i class="format code" />
      </button>
      <button
        :class="`toolbar-item spaced ${isLink ? 'active' : ''}`"
        type="button"
        aria-label="Insert Link"
        @click="insertLink"
      >
        <i class="format link" />
      </button>
      <DropdownColorPicker
        :disabled="false"
        button-class-name="toolbar-item color-picker"
        button-aria-label="Formatting text color"
        button-icon-class-name="icon font-color"
        :color="fontColor"
        @change="onFontColorSelect"
      />
      <DropdownColorPicker
        :disabled="false"
        button-class-name="toolbar-item color-picker"
        button-aria-label="Formatting background color"
        button-icon-class-name="icon bg-color"
        :color="bgColor"
        @change="onBgColorSelect"
      />
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
