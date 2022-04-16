<script setup lang="ts">
import type {
  EditorState,
  ElementNode,
  GridSelection,
  LexicalNode,
  NodeSelection,
  RangeSelection,
  RootNode,
  TextNode,
} from 'lexical'

import {
  $getRoot,
  $getSelection,
  $isElementNode,
  $isGridSelection,
  $isRangeSelection,
  $isTextNode,
} from 'lexical'
import { computed, onUnmounted, ref, watchEffect } from 'vue'
import { useEditor } from '../composables/useEditor'

const NON_SINGLE_WIDTH_CHARS_REPLACEMENT: Record<string, string> = Object.freeze({
  '\t': '\\t',
  '\n': '\\n',
})
const NON_SINGLE_WIDTH_CHARS_REGEX = new RegExp(
  Object.keys(NON_SINGLE_WIDTH_CHARS_REPLACEMENT).join('|'),
  'g',
)
const SYMBOLS = Object.freeze({
  ancestorHasNextSibling: '|',
  ancestorIsLastChild: ' ',
  hasNextSibling: '├',
  isLastChild: '└',
  selectedChar: '^',
  selectedLine: '>',
})

function printRangeSelection(selection: RangeSelection): string {
  let res = ''

  const formatText = printFormatProperties(selection)
  res += `: range ${formatText !== '' ? `{ ${formatText} }` : ''}`

  const anchor = selection.anchor
  const focus = selection.focus
  const anchorOffset = anchor.offset
  const focusOffset = focus.offset

  res += `\n  ├ anchor { key: ${anchor.key}, offset: ${
    anchorOffset === null ? 'null' : anchorOffset
  }, type: ${anchor.type} }`
  res += `\n  └ focus { key: ${focus.key}, offset: ${
    focusOffset === null ? 'null' : focusOffset
  }, type: ${focus.type} }`
  return res
}

function printObjectSelection(selection: NodeSelection): string {
  return `: node\n  └ [${Array.from(selection._nodes).join(', ')}]`
}

function printGridSelection(selection: GridSelection): string {
  return `: grid\n  └ { grid: ${selection.gridKey}, anchorCell: ${selection.anchorCellKey}, focusCell: ${selection.focusCellKey} }`
}

function generateContent(editorState: EditorState): string {
  let res = ' root\n'

  const selectionString = editorState.read(() => {
    const selection = $getSelection()

    visitTree($getRoot(), (node: RootNode, indent: string[]) => {
      const nodeKey = node.getKey()
      const nodeKeyDisplay = `(${nodeKey})`
      const typeDisplay = node.getType() || ''
      const isSelected = node.isSelected()

      res += `${isSelected ? SYMBOLS.selectedLine : ' '} ${indent.join(
        ' ',
      )} ${nodeKeyDisplay} ${typeDisplay} ${printNode(node)}\n`

      res += printSelectedCharsLine({
        indent,
        isSelected,
        node,
        nodeKeyDisplay,
        selection: selection as RangeSelection,
        typeDisplay,
      })
    })

    return selection === null
      ? ': null'
      : $isRangeSelection(selection)
        ? printRangeSelection(selection as RangeSelection)
        : $isGridSelection(selection)
          ? printGridSelection(selection as GridSelection)
          : printObjectSelection(selection as NodeSelection)
  })

  return `${res}\n selection${selectionString}`
}

function visitTree(currentNode: ElementNode, visitor: (arg0: RootNode, indent: string[]) => void, indent: string[] = []) {
  const childNodes = currentNode.getChildren()
  const childNodesLength = childNodes.length

  childNodes.forEach((childNode, i) => {
    visitor(
      childNode as RootNode,
      indent.concat(
        i === childNodesLength - 1
          ? SYMBOLS.isLastChild
          : SYMBOLS.hasNextSibling,
      ),
    )

    if ($isElementNode(childNode)) {
      visitTree(
        childNode as ElementNode,
        visitor,
        indent.concat(
          i === childNodesLength - 1
            ? SYMBOLS.ancestorIsLastChild
            : SYMBOLS.ancestorHasNextSibling,
        ),
      )
    }
  })
}

function normalize(text: string) {
  return Object.entries(NON_SINGLE_WIDTH_CHARS_REPLACEMENT).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(key, 'g'), String(value)),
    text,
  )
}

function printNode(node: TextNode | RootNode) {
  if ($isTextNode(node)) {
    const text = node.getTextContent(true)
    const title = text.length === 0 ? '(empty)' : `"${normalize(text)}"`
    const properties = printAllProperties(node as TextNode)
    return [title, properties.length !== 0 ? `{ ${properties} }` : null]
      .filter(Boolean)
      .join(' ')
      .trim()
  }

  return ''
}

const FORMAT_PREDICATES = [
  (node: TextNode) => node.hasFormat('bold') && 'Bold',
  (node: TextNode) => node.hasFormat('code') && 'Code',
  (node: TextNode) => node.hasFormat('italic') && 'Italic',
  (node: TextNode) => node.hasFormat('strikethrough') && 'Strikethrough',
  (node: TextNode) => node.hasFormat('underline') && 'Underline',
]

const DETAIL_PREDICATES = [
  (node: TextNode) => node.isDirectionless() && 'Directionless',
  (node: TextNode) => node.isUnmergeable() && 'Unmergeable',
]

const MODE_PREDICATES = [
  (node: TextNode) => node.isToken() && 'Token',
  (node: TextNode) => node.isSegmented() && 'Segmented',
  (node: TextNode) => node.isInert() && 'Inert',
]

function printAllProperties(node: TextNode) {
  return [
    printFormatProperties(node),
    printDetailProperties(node),
    printModeProperties(node),
  ]
    .filter(Boolean)
    .join(', ')
}

function printDetailProperties(nodeOrSelection: TextNode) {
  let str = DETAIL_PREDICATES.map(predicate => predicate(nodeOrSelection))
    .filter(Boolean)
    .join(', ')
    .toLocaleLowerCase()
  if (str !== '')
    str = `detail: ${str}`

  return str
}

function printModeProperties(nodeOrSelection: TextNode) {
  let str = MODE_PREDICATES.map(predicate => predicate(nodeOrSelection))
    .filter(Boolean)
    .join(', ')
    .toLocaleLowerCase()
  if (str !== '')
    str = `mode: ${str}`

  return str
}

function printFormatProperties(nodeOrSelection: TextNode | NodeSelection | RangeSelection) {
  let str = FORMAT_PREDICATES.map(predicate => predicate(nodeOrSelection as TextNode))
    .filter(Boolean)
    .join(', ')
    .toLocaleLowerCase()
  if (str !== '')
    str = `format: ${str}`

  return str
}

function printSelectedCharsLine({
  indent,
  isSelected,
  node,
  nodeKeyDisplay,
  selection,
  typeDisplay,
}: {
  indent: string[]
  isSelected: boolean
  node: LexicalNode | null | undefined
  nodeKeyDisplay: string
  selection: RangeSelection
  typeDisplay: string
}) {
  // No selection or node is not selected.
  if (
    !$isTextNode(node)
    || !$isRangeSelection(selection)
    || !isSelected
    || $isElementNode(node)
  )
    return ''

  // No selected characters.
  const anchor = selection.anchor
  const focus = selection.focus
  if (
    node?.getTextContent() === ''
    || (anchor.getNode() === selection.focus.getNode()
      && anchor.offset === focus.offset)
  )
    return ''

  const [start, end] = $getSelectionStartEnd(node as TextNode, selection)

  if (start === end)
    return ''

  const selectionLastIndent
    = indent[indent.length - 1] === SYMBOLS.hasNextSibling
      ? SYMBOLS.ancestorHasNextSibling
      : SYMBOLS.ancestorIsLastChild

  const indentionChars = [
    ...indent.slice(0, indent.length - 1),
    selectionLastIndent,
  ]
  const unselectedChars = Array(start).fill(' ')
  const selectedChars = Array(end - start).fill(SYMBOLS.selectedChar)
  const paddingLength = typeDisplay.length + 3 // 2 for the spaces around + 1 for the double quote.
  const nodePrintSpaces = Array(nodeKeyDisplay.length + paddingLength).fill(
    ' ',
  )

  return (
    `${[
      SYMBOLS.selectedLine,
      indentionChars.join(' '),
      [...nodePrintSpaces, ...unselectedChars, ...selectedChars].join(''),
    ].join(' ')}\n`
  )
}

function $getSelectionStartEnd(node: TextNode, selection: RangeSelection): [number, number] {
  const anchor = selection.anchor
  const focus = selection.focus
  const textContent = node.getTextContent(true)
  const textLength = textContent.length

  let start = -1
  let end = -1
  // Only one node is being selected.
  if (anchor.type === 'text' && focus.type === 'text') {
    const anchorNode = anchor.getNode()
    const focusNode = focus.getNode()
    if (
      anchorNode === focusNode
      && node === anchorNode
      && anchor.offset !== focus.offset
    ) {
      [start, end]
        = anchor.offset < focus.offset
          ? [anchor.offset, focus.offset]
          : [focus.offset, anchor.offset]
    }
    else if (node === anchorNode) {
      [start, end] = anchorNode.isBefore(focusNode)
        ? [anchor.offset, textLength]
        : [0, anchor.offset]
    }
    else if (node === focusNode) {
      [start, end] = focusNode.isBefore(anchorNode)
        ? [focus.offset, textLength]
        : [0, focus.offset]
    }
    else {
      // Node is within selection but not the anchor nor focus.
      [start, end] = [0, textLength]
    }
  }

  // Account for non-single width characters.
  const numNonSingleWidthCharBeforeSelection = (
    textContent.slice(0, start).match(NON_SINGLE_WIDTH_CHARS_REGEX) || []
  ).length
  const numNonSingleWidthCharInSelection = (
    textContent.slice(start, end).match(NON_SINGLE_WIDTH_CHARS_REGEX) || []
  ).length

  return [
    start + numNonSingleWidthCharBeforeSelection,
    end
      + numNonSingleWidthCharBeforeSelection
      + numNonSingleWidthCharInSelection,
  ]
}

const props = defineProps<{
  timeTravelButtonClassName: string
  timeTravelPanelButtonClassName: string
  timeTravelPanelClassName: string
  timeTravelPanelSliderClassName: string
  viewClassName: string
}>()
const editor = useEditor()

const timeStampedEditorStates = ref<[number, EditorState][]>([])
const content = ref('')
const timeTravelEnabled = ref(false)
const playingIndexRef = ref(0)
const treeElementRef = ref<HTMLPreElement>()
const inputRef = ref<HTMLInputElement >()
const isPlaying = ref(false)

let unregisterListener: () => void

watchEffect((onInvalidate) => {
  content.value = generateContent(editor.getEditorState())

  unregisterListener = editor.registerUpdateListener(({ editorState }) => {
    const compositionKey = editor._compositionKey
    const treeText = generateContent(editor.getEditorState())
    const compositionText
        = compositionKey !== null && `Composition key: ${compositionKey}`
    content.value = [treeText, compositionText].filter(Boolean).join('\n\n')
    if (!timeTravelEnabled.value) {
      timeStampedEditorStates.value = [
        ...timeStampedEditorStates.value,
        [Date.now(), editorState],
      ]
    }
  })

  onInvalidate(() => {
    unregisterListener()
  })
})

const totalEditorStates = computed(() => timeStampedEditorStates.value.length)

let timeoutId: NodeJS.Timeout

watchEffect((onInvalidate) => {
  if (isPlaying.value) {
    const play = () => {
      const currentIndex = playingIndexRef.value
      if (currentIndex === totalEditorStates.value - 1) {
        isPlaying.value = false
        return
      }
      const currentTime = timeStampedEditorStates.value[currentIndex][0]
      const nextTime = timeStampedEditorStates.value[currentIndex + 1][0]
      const timeDiff = nextTime - currentTime
      timeoutId = setTimeout(() => {
        playingIndexRef.value++
        const index = playingIndexRef.value
        const input = inputRef.value
        if (input)
          input.value = String(index)

        editor.setEditorState(timeStampedEditorStates.value[index][1])
        play()
      }, timeDiff)
    }

    play()
  }

  onInvalidate(() => {
    clearTimeout(timeoutId)
  })
})

watchEffect(() => {
  const element = treeElementRef.value

  if (element) {
    // @ts-expect-error: Internal field
    element.__lexicalEditor = editor
  }
})

onUnmounted(() => {
  unregisterListener?.()
  clearTimeout(timeoutId)
  // @ts-expect-error: Internal field
  element.__lexicalEditor = null
})

const enableTimeTravel = () => {
  const rootElement = editor.getRootElement()
  if (rootElement !== null) {
    rootElement.contentEditable = 'false'
    playingIndexRef.value = totalEditorStates.value - 1
    timeTravelEnabled.value = true
  }
}

const updateEditorState = (e: Event) => {
  const editorStateIndex = Number((e.target as HTMLInputElement).value)
  const timeStampedEditorState
                = timeStampedEditorStates.value[editorStateIndex]
  if (timeStampedEditorState) {
    playingIndexRef.value = editorStateIndex
    editor.setEditorState(timeStampedEditorState[1])
  }
}

const exit = () => {
  const rootElement = editor.getRootElement()
  if (rootElement) {
    rootElement.contentEditable = 'true'
    const index = timeStampedEditorStates.value.length - 1
    const timeStampedEditorState = timeStampedEditorStates.value[index]
    editor.setEditorState(timeStampedEditorState[1])
    const input = inputRef.value
    if (input)
      input.value = String(index)

    timeTravelEnabled.value = false
    isPlaying.value = false
  }
}
</script>

<template>
  <div :class="viewClassName">
    <button
      v-if="!timeTravelEnabled && totalEditorStates > 2"
      :class="timeTravelButtonClassName"
      @click="enableTimeTravel"
    >
      Time Travel
    </button>
    <pre ref="treeElement">{{ content }}</pre>
    <div v-if="timeTravelEnabled" :class="timeTravelPanelClassName">
      <button :class="timeTravelPanelButtonClassName" @click="isPlaying = !isPlaying">
        {{ isPlaying ? 'Pause' : 'Play' }}
      </button>
      <input
        ref="inputRef"
        :class="timeTravelPanelSliderClassName"
        type="range"
        min="1"
        :max="totalEditorStates - 1"
        @input="updateEditorState"
      >
      <button :class="timeTravelPanelButtonClassName" @click="exit">
        Exit
      </button>
    </div>
  </div>
</template>
