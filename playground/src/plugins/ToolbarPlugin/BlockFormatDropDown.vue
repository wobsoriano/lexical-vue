<script setup lang="ts">
import { $createCodeNode } from '@lexical/code'
import { $createParagraphNode, $createTextNode, $getSelection, $isRangeSelection, type LexicalEditor } from 'lexical'
import { $wrapNodes } from '@lexical/selection'
import type { HeadingTagType } from '@lexical/rich-text'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from '@lexical/list'
import { blockTypeToBlockName, dropDownActiveClass } from './shared'
import DropDown from '@/ui/DropDown.vue'
import DropDownItem from '@/ui/DropDownItem.vue'
import { $isTweetNode } from '@/nodes/TweetNode'
import { $isYouTubeNode } from '@/nodes/YouTubeNode'

const props = defineProps<{
  editor: LexicalEditor
  blockType: keyof typeof blockTypeToBlockName
}>()

function formatParagraph() {
  if (props.blockType !== 'paragraph') {
    props.editor.update(() => {
      const selection = $getSelection()

      if ($isRangeSelection(selection))
        $wrapNodes(selection, () => $createParagraphNode())
    })
  }
}

function formatHeading(headingSize: HeadingTagType) {
  if (props.blockType !== headingSize) {
    props.editor.update(() => {
      const selection = $getSelection()

      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () =>
          $createHeadingNode(headingSize))
      }
    })
  }
}

function formatBulletList() {
  if (props.blockType !== 'bullet')
    props.editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
  else
    props.editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
}

function formatCheckList() {
  if (props.blockType !== 'check')
    props.editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)
  else
    props.editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
}

function formatNumberedList() {
  if (props.blockType !== 'number')
    props.editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
  else
    props.editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
}

function formatQuote() {
  if (props.blockType !== 'quote') {
    props.editor.update(() => {
      const selection = $getSelection()

      if ($isRangeSelection(selection))
        $wrapNodes(selection, () => $createQuoteNode())
    })
  }
}

function formatCode() {
  if (props.blockType !== 'code') {
    props.editor.update(() => {
      const selection = $getSelection()

      if ($isRangeSelection(selection)) {
        if (selection.isCollapsed()) {
          $wrapNodes(selection, () => $createCodeNode())
        }
        else {
          selection.getNodes().forEach((node) => {
            // Explicity set fallback text content for some decorators nodes.
            if ($isTweetNode(node)) {
              node.replace(
                $createTextNode(
                    `https://twitter.com/i/web/status/${node.getId()}`,
                ),
              )
            }
            else if ($isYouTubeNode(node)) {
              node.replace(
                $createTextNode(
                    `https://www.youtube.com/watch?v=${node.getId()}`,
                ),
              )
            }
          })

          const textContent = selection.getTextContent()
          const codeNode = $createCodeNode()
          selection.insertNodes([codeNode])
          selection.insertRawText(textContent)
        }
      }
    })
  }
}
</script>

<template>
  <DropDown
    button-class-name="toolbar-item block-controls"
    :button-icon-class-name="`icon block-type ${blockType}`"
    :button-label="blockTypeToBlockName[blockType]"
    button-aria-label="Formatting options for text style"
  >
    <DropDownItem
      :class="`item ${dropDownActiveClass(blockType === 'paragraph')}`"
      @click="formatParagraph"
    >
      <i class="icon paragraph" />
      <span class="text">Normal</span>
    </DropDownItem>
    <DropDownItem
      :class="`item ${dropDownActiveClass(blockType === 'h1')}`"
      @click="formatHeading('h1')"
    >
      <i class="icon h1" />
      <span class="text">Heading 1</span>
    </DropDownItem>
    <DropDownItem
      :class="`item ${dropDownActiveClass(blockType === 'h2')}`"
      @click="formatHeading('h2')"
    >
      <i class="icon h2" />
      <span class="text">Heading 2</span>
    </DropDownItem>
    <DropDownItem :class="`item ${dropDownActiveClass(blockType === 'h3')}`" @click="formatHeading('h3')">
      <i class="icon h3" />
      <span class="text">Heading 3</span>
    </DropDownItem>
    <DropDownItem
      :class="`item ${dropDownActiveClass(blockType === 'bullet')}`" @click="formatBulletList"
    >
      <i class="icon bullet-list" />
      <span class="text">Bullet List</span>
    </DropDownItem>
    <DropDownItem
      :class="`item ${dropDownActiveClass(blockType === 'number')}`" @click="formatNumberedList"
    >
      <i class="icon numbered-list" />
      <span class="text">Numbered List</span>
    </DropDownItem>
    <DropDownItem :class="`item ${dropDownActiveClass(blockType === 'check')}`" @click="formatCheckList">
      <i class="icon check-list" />
      <span class="text">Check List</span>
    </DropDownItem>
    <DropDownItem
      :class="`item ${dropDownActiveClass(blockType === 'quote')}`" @click="formatQuote"
    >
      <i class="icon quote" />
      <span class="text">Quote</span>
    </DropDownItem>
    <DropDownItem :class="`item ${dropDownActiveClass(blockType === 'code')}`" @click="formatCode">
      <i class="icon code" />
      <span class="text">Code Block</span>
    </DropDownItem>
  </DropDown>
</template>
