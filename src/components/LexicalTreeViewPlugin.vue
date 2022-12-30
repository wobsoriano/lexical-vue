<script setup lang="ts">
import type {
  EditorState,
  ElementNode,
  GridSelection,
  LexicalNode,
  NodeSelection,
  RangeSelection,
} from 'lexical'

import { $isMarkNode } from '@lexical/mark'
import {
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  DEPRECATED_$isGridSelection,
} from 'lexical'
import { computed, onUnmounted, ref, watchEffect } from 'vue'
import type { LinkNode } from '@lexical/link'
import { $isLinkNode } from '@lexical/link'
import { useEditor } from '../composables/useEditor'

defineProps<{
  timeTravelButtonClassName: string
  timeTravelPanelSliderClassName: string
  timeTravelPanelButtonClassName: string
  timeTravelPanelClassName: string
  viewClassName: string
}>()
const NON_SINGLE_WIDTH_CHARS_REPLACEMENT: Readonly<Record<string, string>>
  = Object.freeze({
    '\t': '\\t',
    '\n': '\\n',
  })
const NON_SINGLE_WIDTH_CHARS_REGEX = new RegExp(
  Object.keys(NON_SINGLE_WIDTH_CHARS_REPLACEMENT).join('|'),
  'g',
)
const SYMBOLS: Record<string, string> = Object.freeze({
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
  return `: grid\n  └ { grid: ${selection.gridKey}, anchorCell: ${selection.anchor.key}, focusCell: ${selection.focus.key} }`
}

function generateContent(editorState: EditorState): string {
  let res = ' root\n'

  const selectionString = editorState.read(() => {
    const selection = $getSelection()

    visitTree($getRoot(), (node: LexicalNode, indent: Array<string>) => {
      const nodeKey = node.getKey()
      const nodeKeyDisplay = `(${nodeKey})`
      const typeDisplay = node.getType() || ''
      const isSelected = node.isSelected()
      const idsDisplay = $isMarkNode(node)
        ? ` id: [ ${node.getIDs().join(', ')} ] `
        : ''

      res += `${isSelected ? SYMBOLS.selectedLine : ' '} ${indent.join(
        ' ',
      )} ${nodeKeyDisplay} ${typeDisplay} ${idsDisplay} ${printNode(node)}\n`

      res += printSelectedCharsLine({
        indent,
        isSelected,
        node,
        nodeKeyDisplay,
        selection,
        typeDisplay,
      })
    })

    return selection === null
      ? ': null'
      : $isRangeSelection(selection)
        ? printRangeSelection(selection)
        : DEPRECATED_$isGridSelection(selection)
          ? printGridSelection(selection)
          : printObjectSelection(selection)
  })

  return `${res}\n selection${selectionString}`
}

function visitTree(
  currentNode: ElementNode,
  visitor: (node: LexicalNode, indentArr: Array<string>) => void,
  indent: Array<string> = [],
) {
  const childNodes = currentNode.getChildren()
  const childNodesLength = childNodes.length

  childNodes.forEach((childNode, i) => {
    visitor(
      childNode,
      indent.concat(
        i === childNodesLength - 1
          ? SYMBOLS.isLastChild
          : SYMBOLS.hasNextSibling,
      ),
    )

    if ($isElementNode(childNode)) {
      visitTree(
        childNode,
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

// TODO Pass via props to allow customizability
function printNode(node: LexicalNode) {
  if ($isTextNode(node)) {
    const text = node.getTextContent()
    const title = text.length === 0 ? '(empty)' : `"${normalize(text)}"`
    const properties = printAllTextNodeProperties(node)
    return [title, properties.length !== 0 ? `{ ${properties} }` : null]
      .filter(Boolean)
      .join(' ')
      .trim()
  }
  else if ($isLinkNode(node)) {
    const link = node.getURL()
    const title = link.length === 0 ? '(empty)' : `"${normalize(link)}"`
    const properties = printAllLinkNodeProperties(node)
    return [title, properties.length !== 0 ? `{ ${properties} }` : null]
      .filter(Boolean)
      .join(' ')
      .trim()
  }
  else {
    return ''
  }
}

const FORMAT_PREDICATES = [
  (node: LexicalNode | RangeSelection) => node.hasFormat('bold') && 'Bold',
  (node: LexicalNode | RangeSelection) => node.hasFormat('code') && 'Code',
  (node: LexicalNode | RangeSelection) => node.hasFormat('italic') && 'Italic',
  (node: LexicalNode | RangeSelection) =>
    node.hasFormat('strikethrough') && 'Strikethrough',
  (node: LexicalNode | RangeSelection) =>
    node.hasFormat('subscript') && 'Subscript',
  (node: LexicalNode | RangeSelection) =>
    node.hasFormat('superscript') && 'Superscript',
  (node: LexicalNode | RangeSelection) =>
    node.hasFormat('underline') && 'Underline',
]

const DETAIL_PREDICATES = [
  (node: LexicalNode) => node.isDirectionless() && 'Directionless',
  (node: LexicalNode) => node.isUnmergeable() && 'Unmergeable',
]

const MODE_PREDICATES = [
  (node: LexicalNode) => node.isToken() && 'Token',
  (node: LexicalNode) => node.isSegmented() && 'Segmented',
]

function printAllTextNodeProperties(node: LexicalNode) {
  return [
    printFormatProperties(node),
    printDetailProperties(node),
    printModeProperties(node),
  ]
    .filter(Boolean)
    .join(', ')
}

function printAllLinkNodeProperties(node: LinkNode) {
  return [printTargetProperties(node), printRelProperties(node)]
    .filter(Boolean)
    .join(', ')
}

function printDetailProperties(nodeOrSelection: LexicalNode) {
  let str = DETAIL_PREDICATES.map(predicate => predicate(nodeOrSelection))
    .filter(Boolean)
    .join(', ')
    .toLocaleLowerCase()

  if (str !== '')
    str = `detail: ${str}`

  return str
}

function printModeProperties(nodeOrSelection: LexicalNode) {
  let str = MODE_PREDICATES.map(predicate => predicate(nodeOrSelection))
    .filter(Boolean)
    .join(', ')
    .toLocaleLowerCase()

  if (str !== '')
    str = `mode: ${str}`

  return str
}

function printFormatProperties(nodeOrSelection: LexicalNode | RangeSelection) {
  let str = FORMAT_PREDICATES.map(predicate => predicate(nodeOrSelection))
    .filter(Boolean)
    .join(', ')
    .toLocaleLowerCase()

  if (str !== '')
    str = `format: ${str}`

  return str
}

function printTargetProperties(node: LinkNode) {
  let str = node.getTarget()
  // TODO Fix nullish on LinkNode
  if (str != null)
    str = `target: ${str}`

  return str
}

function printRelProperties(node: LinkNode) {
  let str = node.getRel()
  // TODO Fix nullish on LinkNode
  if (str != null)
    str = `rel: ${str}`

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
  indent: Array<string>
  isSelected: boolean
  node: LexicalNode
  nodeKeyDisplay: string
  selection: GridSelection | NodeSelection | RangeSelection | null
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
    node.getTextContent() === ''
    || (anchor.getNode() === selection.focus.getNode()
      && anchor.offset === focus.offset)
  )
    return ''

  const [start, end] = $getSelectionStartEnd(node, selection)

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
  const unselectedChars = Array(start + 1).fill(' ')
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

function $getSelectionStartEnd(
  node: LexicalNode,
  selection: RangeSelection | GridSelection,
): [number, number] {
  const anchor = selection.anchor
  const focus = selection.focus
  const textContent = node.getTextContent()
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

const editor = useEditor()

const timeStampedEditorStates = ref<[number, EditorState][]>([])
const content = ref('')
const timeTravelEnabled = ref(false)
const playingIndexRef = ref(0)
const treeElementRef = ref<HTMLPreElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
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

let timeoutId: ReturnType<typeof setTimeout>

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
let element: HTMLPreElement | null = null
watchEffect(() => {
  element = treeElementRef.value
  if (element) {
    // @ts-expect-error: Internal field
    element.__lexicalEditor = editor
  }
})

onUnmounted(() => {
  unregisterListener?.()
  clearTimeout(timeoutId)
  if (element) {
    // @ts-expect-error: Internal field
    element.__lexicalEditor = null
  }
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
