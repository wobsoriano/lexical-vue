<script setup lang="ts">
import { mergeRegister } from '@lexical/utils'
import type { LexicalCommand, LexicalEditor, TextNode } from 'lexical'
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
  createCommand,
} from 'lexical'
import { computed, ref, watch, watchPostEffect } from 'vue'
import type { QueryMatch, Resolution, TypeaheadOption } from '../composables'
import { useEditor, useEffect, useMounted } from '../composables'

const props = defineProps<{
  anchorElementRef: HTMLElement
  resolution: Resolution
  options: Array<TypeaheadOption>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'selectOption', payload: {
    close: () => void
    option: TypeaheadOption
    textNodeContainingQuery: TextNode | null
    matchingString: string
  }): void
}>()

const SCROLL_TYPEAHEAD_OPTION_INTO_VIEW_COMMAND: LexicalCommand<{
  index: number
  option: TypeaheadOption
}> = createCommand('SCROLL_TYPEAHEAD_OPTION_INTO_VIEW_COMMAND')

const editor = useEditor()

const selectedIndex = ref<null | number>(null)

watch(() => props.resolution.match.matchingString, () => {
  selectedIndex.value = 0
})

/**
 * Split Lexical TextNode and return a new TextNode only containing matched text.
 * Common use cases include: removing the node, replacing with a new node.
 */
function splitNodeContainingQuery(
  editor: LexicalEditor,
  match: QueryMatch,
): TextNode | null {
  const selection = $getSelection()
  if (!$isRangeSelection(selection) || !selection.isCollapsed())
    return null

  const anchor = selection.anchor
  if (anchor.type !== 'text')
    return null

  const anchorNode = anchor.getNode()
  if (!anchorNode.isSimpleText())
    return null

  const selectionOffset = anchor.offset
  const textContent = anchorNode.getTextContent().slice(0, selectionOffset)
  const characterOffset = match.replaceableString.length
  const queryOffset = getFullMatchOffset(
    textContent,
    match.matchingString,
    characterOffset,
  )
  const startOffset = selectionOffset - queryOffset
  if (startOffset < 0)
    return null

  let newNode
  if (startOffset === 0)
    [newNode] = anchorNode.splitText(selectionOffset)

  else
    [, newNode] = anchorNode.splitText(startOffset, selectionOffset)

  return newNode
}

/**
 * Walk backwards along user input and forward through entity title to try
 * and replace more of the user's text with entity.
 */
function getFullMatchOffset(
  documentText: string,
  entryText: string,
  offset: number,
): number {
  let triggerOffset = offset
  for (let i = triggerOffset; i <= entryText.length; i++) {
    if (documentText.substr(-i) === entryText.substr(0, i))
      triggerOffset = i
  }
  return triggerOffset
}

function selectOptionAndCleanUp(selectedEntry: TypeaheadOption) {
  editor.update(() => {
    const textNodeContainingQuery = splitNodeContainingQuery(
      editor,
      props.resolution.match,
    )

    emit('selectOption', {
      close() {
        emit('close')
      },
      option: selectedEntry,
      textNodeContainingQuery,
      matchingString: props.resolution.match.matchingString,
    })
  })
}

function updateSelectedIndex(index: number) {
  const rootElem = editor.getRootElement()
  if (rootElem !== null) {
    rootElem.setAttribute(
      'aria-activedescendant',
        `typeahead-item-${index}`,
    )
    selectedIndex.value = index
  }
}

watchPostEffect(() => {
  if (props.options === null)
    selectedIndex.value = null

  else if (selectedIndex.value === null)
    updateSelectedIndex(0)
})

function scrollIntoViewIfNeeded(target: HTMLElement) {
  const container = document.getElementById('typeahead-menu')

  if (container) {
    const parentNode = target.parentNode as HTMLElement | null

    if (
      parentNode
      && /auto|scroll/.test(getComputedStyle(parentNode).overflow)
    ) {
      const parentRect = parentNode.getBoundingClientRect()

      if (parentRect.top + parentRect.height > window.innerHeight)
        parentNode.scrollIntoView(false)

      parentNode.scrollTop = target.offsetTop - target.clientHeight
    }
    else {
      target.scrollIntoView(false)
    }
  }
}

useMounted(() => {
  return mergeRegister(
    editor.registerCommand(
      SCROLL_TYPEAHEAD_OPTION_INTO_VIEW_COMMAND,
      ({ option }) => {
        if (option.elRef?.value) {
          scrollIntoViewIfNeeded(option.elRef.value)
          return true
        }

        return false
      },
      COMMAND_PRIORITY_LOW,
    ),
  )
})

useEffect(() => {
  return mergeRegister(
    editor.registerCommand<KeyboardEvent>(
      KEY_ARROW_DOWN_COMMAND,
      (payload) => {
        const event = payload
        if (props.options !== null && props.options.length && selectedIndex.value !== null) {
          const newSelectedIndex
            = selectedIndex.value !== props.options.length - 1 ? selectedIndex.value + 1 : 0
          updateSelectedIndex(newSelectedIndex)
          const option = props.options[newSelectedIndex]
          if (option.elRef?.value !== null && option.elRef?.value) {
            editor.dispatchCommand(
              SCROLL_TYPEAHEAD_OPTION_INTO_VIEW_COMMAND,
              {
                index: newSelectedIndex,
                option,
              },
            )
          }
          event.preventDefault()
          event.stopImmediatePropagation()
        }
        return true
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand<KeyboardEvent>(
      KEY_ARROW_UP_COMMAND,
      (payload) => {
        const event = payload
        if (props.options !== null && props.options.length && selectedIndex.value !== null) {
          const newSelectedIndex
            = selectedIndex.value !== 0 ? selectedIndex.value - 1 : props.options.length - 1
          updateSelectedIndex(newSelectedIndex)
          const option = props.options[newSelectedIndex]
          if (option.elRef?.value !== null && option.elRef?.value)
            scrollIntoViewIfNeeded(option.elRef.value)

          event.preventDefault()
          event.stopImmediatePropagation()
        }
        return true
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand<KeyboardEvent>(
      KEY_ESCAPE_COMMAND,
      (payload) => {
        const event = payload
        event.preventDefault()
        event.stopImmediatePropagation()
        emit('close')
        return true
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand<KeyboardEvent>(
      KEY_TAB_COMMAND,
      (payload) => {
        const event = payload
        if (
          props.options === null
          || selectedIndex.value === null
          || props.options[selectedIndex.value] == null
        )
          return false

        event.preventDefault()
        event.stopImmediatePropagation()
        selectOptionAndCleanUp(props.options[selectedIndex.value])
        return true
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event: KeyboardEvent | null) => {
        if (
          props.options === null
          || selectedIndex.value === null
          || props.options[selectedIndex.value] == null
        )
          return false

        if (event !== null) {
          event.preventDefault()
          event.stopImmediatePropagation()
        }
        selectOptionAndCleanUp(props.options[selectedIndex.value])
        return true
      },
      COMMAND_PRIORITY_LOW,
    ),
  )
})

const listItemProps = computed(
  () => ({
    options: props.options,
    selectOptionAndCleanUp,
    selectedIndex: selectedIndex.value,
    setHighlightedIndex: updateSelectedIndex,
  }))
</script>

<template>
  <slot
    :list-item-props="listItemProps"
    :anchor-element-ref="anchorElementRef"
    :match-string="resolution.match.matchingString"
  />
</template>
