<script setup lang="ts" generic="TOption extends MenuOption">
import { computed, onUnmounted, ref, watch, watchEffect } from 'vue'
import { $getSelection, $isRangeSelection, KEY_ARROW_DOWN_COMMAND, KEY_ARROW_UP_COMMAND, KEY_ENTER_COMMAND, KEY_ESCAPE_COMMAND, KEY_TAB_COMMAND } from 'lexical'
import type { CommandListenerPriority, LexicalEditor, TextNode } from 'lexical'
import { mergeRegister } from '@lexical/utils'
import { type MenuOption, type MenuResolution, type MenuTextMatch, SCROLL_TYPEAHEAD_OPTION_INTO_VIEW_COMMAND } from './shared'

const props = defineProps<{
  close: () => void
  editor: LexicalEditor
  anchorElementRef: HTMLElement
  resolution: MenuResolution
  options: Array<TOption>
  shouldSplitNodeWithQuery?: boolean
  commandPriority?: CommandListenerPriority
}>()

const emit = defineEmits<{
  (e: 'selectOption', payload: {
    option: TOption
    textNodeContainingQuery: TextNode | null
    closeMenu: () => void
    matchingString: string
  }): void
}>()

const selectedIndex = ref<number | null>(null)
const matchString = computed(() => props.resolution.match && props.resolution.match.matchingString)

function setHighlightedIndex(index: number | null) {
  selectedIndex.value = index
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
    if (documentText.substring(-i) === entryText.substring(0, i))
      triggerOffset = i
  }
  return triggerOffset
}

/**
 * Split Lexical TextNode and return a new TextNode only containing matched text.
 * Common use cases include: removing the node, replacing with a new node.
 */
function $splitNodeContainingQuery(match: MenuTextMatch): TextNode | null {
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

watch(matchString, () => {
  setHighlightedIndex(0)
}, { immediate: true })

function selectOptionAndCleanUp(selectedEntry: TOption) {
  props.editor.update(() => {
    const textNodeContainingQuery
          = props.resolution.match != null && props.shouldSplitNodeWithQuery
            ? $splitNodeContainingQuery(props.resolution.match)
            : null

    emit('selectOption', {
      option: selectedEntry,
      textNodeContainingQuery,
      closeMenu: props.close,
      matchingString: props.resolution.match ? props.resolution.match.matchingString : '',
    })
  })
}

function updateSelectedIndex(index: number) {
  const rootElem = props.editor.getRootElement()
  if (rootElem !== null) {
    rootElem.setAttribute(
      'aria-activedescendant',
          `typeahead-item-${index}`,
    )
    setHighlightedIndex(index)
  }
}

onUnmounted(() => {
  const rootElem = props.editor.getRootElement()
  if (rootElem !== null)
    rootElem.removeAttribute('aria-activedescendant')
})

watchEffect(() => {
  if (props.options === null)
    setHighlightedIndex(null)
  else if (selectedIndex.value === null)
    updateSelectedIndex(0)
})

function scrollIntoViewIfNeeded(target: HTMLElement) {
  const typeaheadContainerNode = document.getElementById('typeahead-menu')
  if (!typeaheadContainerNode)
    return

  const typeaheadRect = typeaheadContainerNode.getBoundingClientRect()

  if (typeaheadRect.top + typeaheadRect.height > window.innerHeight) {
    typeaheadContainerNode.scrollIntoView({
      block: 'center',
    })
  }

  if (typeaheadRect.top < 0) {
    typeaheadContainerNode.scrollIntoView({
      block: 'center',
    })
  }

  target.scrollIntoView({ block: 'nearest' })
}

watchEffect((onInvalidate) => {
  if (!props.commandPriority)
    return

  const fn = mergeRegister(
    props.editor.registerCommand(
      SCROLL_TYPEAHEAD_OPTION_INTO_VIEW_COMMAND,
      ({ option }) => {
        if (option.ref && option.ref != null) {
          scrollIntoViewIfNeeded(option.ref)
          return true
        }

        return false
      },
      props.commandPriority,
    ),
  )

  onInvalidate(fn)
})

watchEffect((onInvalidate) => {
  if (!props.commandPriority)
    return

  const fn = mergeRegister(
    props.editor.registerCommand<KeyboardEvent>(
      KEY_ARROW_DOWN_COMMAND,
      (payload) => {
        const event = payload
        if (props.options !== null && props.options.length && selectedIndex.value !== null) {
          const newSelectedIndex
                = selectedIndex.value !== props.options.length - 1 ? selectedIndex.value + 1 : 0
          updateSelectedIndex(newSelectedIndex)
          const option = props.options[newSelectedIndex]
          if (option.ref != null && option.ref) {
            props.editor.dispatchCommand(
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
      props.commandPriority,
    ),
    props.editor.registerCommand<KeyboardEvent>(
      KEY_ARROW_UP_COMMAND,
      (payload) => {
        const event = payload
        if (props.options !== null && props.options.length && selectedIndex.value !== null) {
          const newSelectedIndex
                = selectedIndex.value !== 0 ? selectedIndex.value! - 1 : props.options.length - 1
          updateSelectedIndex(newSelectedIndex)
          const option = props.options[newSelectedIndex]
          if (option.ref != null && option.ref)
            scrollIntoViewIfNeeded(option.ref)

          event.preventDefault()
          event.stopImmediatePropagation()
        }
        return true
      },
      props.commandPriority,
    ),
    props.editor.registerCommand<KeyboardEvent>(
      KEY_ESCAPE_COMMAND,
      (payload) => {
        const event = payload
        event.preventDefault()
        event.stopImmediatePropagation()
        close()
        return true
      },
      props.commandPriority,
    ),
    props.editor.registerCommand<KeyboardEvent>(
      KEY_TAB_COMMAND,
      (payload) => {
        const event = payload
        if (
          props.options === null
          || selectedIndex.value === null
          || props.options[selectedIndex.value] == null
        ) {
          return false
        }

        event.preventDefault()
        event.stopImmediatePropagation()
        selectOptionAndCleanUp(props.options[selectedIndex.value])
        return true
      },
      props.commandPriority,
    ),
    props.editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event: KeyboardEvent | null) => {
        if (
          props.options === null
          || selectedIndex.value === null
          || props.options[selectedIndex.value] == null
        ) {
          return false
        }

        if (event !== null) {
          event.preventDefault()
          event.stopImmediatePropagation()
        }
        selectOptionAndCleanUp(props.options[selectedIndex.value])
        return true
      },
      props.commandPriority,
    ),
  )

  onInvalidate(fn)
})
</script>

<template>
  <slot
    :list-item-props="{
      options: props.options,
      selectOptionAndCleanUp,
      selectedIndex,
      setHighlightedIndex,
    }"
    :anchor-element-ref="anchorElementRef"
    :match-string="resolution.match ? resolution.match.matchingString : ''"
  />
</template>
