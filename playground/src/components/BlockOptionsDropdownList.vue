<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useLexicalComposer } from 'lexical-vue'
import type {
  RangeSelection,
} from 'lexical'
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
} from 'lexical'
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list'
import {
  $wrapNodes,
} from '@lexical/selection'
import {
  $createHeadingNode,
  $createQuoteNode,
} from '@lexical/rich-text'
import {
  $createCodeNode,
} from '@lexical/code'

const props = withDefaults(defineProps<{
  toolbarRef: HTMLDivElement | null
  blockType?: string
}>(), {
  blockType: 'paragraph',
})
const emit = defineEmits<{
  (e: 'update:showBlockOptionsDropDown', value: boolean): void
}>()
const dropDownRef = ref<HTMLDivElement | null>(null)
const editor = useLexicalComposer()

onMounted(() => {
  if (props.toolbarRef && dropDownRef.value) {
    const { top, left } = props.toolbarRef.getBoundingClientRect()
    dropDownRef.value.style.top = `${top + 40}px`
    dropDownRef.value.style.left = `${left}px`
  }
})

function handle(event: Event) {
  const target = event.target as Node

  if (!dropDownRef.value?.contains(target) && !props.toolbarRef?.contains(target))
    emit('update:showBlockOptionsDropDown', false)
}

onMounted(() => {
  if (props.toolbarRef && dropDownRef.value)
    document.addEventListener('click', handle)
})

onUnmounted(() => {
  document.removeEventListener('click', handle)
})

function formatParagraph() {
  if (props.blockType !== 'paragraph') {
    editor.update(() => {
      const selection = $getSelection() as RangeSelection

      if ($isRangeSelection(selection))
        $wrapNodes(selection, () => $createParagraphNode())
    })
  }
  emit('update:showBlockOptionsDropDown', false)
}

function formatLargeHeading() {
  if (props.blockType !== 'h1') {
    editor.update(() => {
      const selection = $getSelection()

      if ($isRangeSelection(selection))
        $wrapNodes(selection, () => $createHeadingNode('h1'))
    })
  }
  emit('update:showBlockOptionsDropDown', false)
}

function formatSmallHeading() {
  if (props.blockType !== 'h2') {
    editor.update(() => {
      const selection = $getSelection()

      if ($isRangeSelection(selection))
        $wrapNodes(selection, () => $createHeadingNode('h2'))
    })
  }
  emit('update:showBlockOptionsDropDown', false)
}

function formatBulletList() {
  if (props.blockType !== 'ul')
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)

  else
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)

  emit('update:showBlockOptionsDropDown', false)
}

function formatNumberedList() {
  if (props.blockType !== 'ol')
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)

  else
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)

  emit('update:showBlockOptionsDropDown', false)
}

function formatQuote() {
  if (props.blockType !== 'quote') {
    editor.update(() => {
      const selection = $getSelection()

      if ($isRangeSelection(selection))
        $wrapNodes(selection, () => $createQuoteNode())
    })
  }
  emit('update:showBlockOptionsDropDown', false)
}

function formatCode() {
  if (props.blockType !== 'code') {
    editor.update(() => {
      const selection = $getSelection()

      if ($isRangeSelection(selection))
        $wrapNodes(selection, () => $createCodeNode())
    })
  }
  emit('update:showBlockOptionsDropDown', false)
}
</script>

<template>
  <div ref="dropDownRef" class="dropdown">
    <button class="item" @click="formatParagraph">
      <span class="icon paragraph" />
      <span class="text">Normal</span>
      <span v-if="blockType === 'paragraph'" class="active" />
    </button>
    <button class="item" @click="formatLargeHeading">
      <span class="icon large-heading" />
      <span class="text">Large Heading</span>
      <span v-if="blockType === 'h1'" class="active" />
    </button>
    <button class="item" @click="formatSmallHeading">
      <span class="icon small-heading" />
      <span class="text">Small Heading</span>
      <span v-if="blockType === 'h2'" class="active" />
    </button>
    <button class="item" @click="formatBulletList">
      <span class="icon bullet-list" />
      <span class="text">Bullet List</span>
      <span v-if="blockType === 'ul'" class="active" />
    </button>
    <button class="item" @click="formatNumberedList">
      <span class="icon numbered-list" />
      <span class="text">Numbered List</span>
      <span v-if="blockType === 'ol'" class="active" />
    </button>
    <button class="item" @click="formatQuote">
      <span class="icon quote" />
      <span class="text">Quote</span>
      <span v-if="blockType === 'quote'" class="active" />
    </button>
    <button class="item" @click="formatCode">
      <span class="icon code" />
      <span class="text">Code Block</span>
      <span v-if="blockType === 'code'" class="active" />
    </button>
  </div>
</template>
