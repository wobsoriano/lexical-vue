import { $isHeadingNode, HeadingNode, type HeadingTagType } from '@lexical/rich-text'
import { $getNextRightPreorderNode, mergeRegister } from '@lexical/utils'
import {
  $getNodeByKey,
  $getRoot,
  $isElementNode,
  type ElementNode,
  type LexicalEditor,
  type NodeKey,
  type NodeMutation,
  TextNode,
} from 'lexical'
import { ref } from 'vue'
import { useMounted } from './useMounted'

export type TableOfContentsEntry = [
  key: NodeKey,
  text: string,
  tag: HeadingTagType,
]

function toEntry(heading: HeadingNode): TableOfContentsEntry {
  return [heading.getKey(), heading.getTextContent(), heading.getTag()]
}

function $insertHeadingIntoTableOfContents(
  prevHeading: HeadingNode | null,
  newHeading: HeadingNode | null,
  currentTableOfContents: Array<TableOfContentsEntry>,
): Array<TableOfContentsEntry> {
  if (newHeading === null)
    return currentTableOfContents

  const newEntry: TableOfContentsEntry = toEntry(newHeading)
  let newTableOfContents: Array<TableOfContentsEntry> = []
  if (prevHeading === null) {
    // check if key already exists
    if (
      currentTableOfContents.length > 0
      && currentTableOfContents[0][0] === newHeading.__key
    ) {
      return currentTableOfContents
    }

    newTableOfContents = [newEntry, ...currentTableOfContents]
  }
  else {
    for (let i = 0; i < currentTableOfContents.length; i++) {
      const key = currentTableOfContents[i][0]
      newTableOfContents.push(currentTableOfContents[i])
      if (key === prevHeading.getKey() && key !== newHeading.getKey()) {
        // check if key already exists
        if (
          i + 1 < currentTableOfContents.length
          && currentTableOfContents[i + 1][0] === newHeading.__key
        ) {
          return currentTableOfContents
        }

        newTableOfContents.push(newEntry)
      }
    }
  }
  return newTableOfContents
}

function $deleteHeadingFromTableOfContents(
  key: NodeKey,
  currentTableOfContents: Array<TableOfContentsEntry>,
): Array<TableOfContentsEntry> {
  const newTableOfContents = []
  for (const heading of currentTableOfContents) {
    if (heading[0] !== key)
      newTableOfContents.push(heading)
  }
  return newTableOfContents
}

function $updateHeadingInTableOfContents(
  heading: HeadingNode,
  currentTableOfContents: Array<TableOfContentsEntry>,
): Array<TableOfContentsEntry> {
  const newTableOfContents: Array<TableOfContentsEntry> = []
  for (const oldHeading of currentTableOfContents) {
    if (oldHeading[0] === heading.getKey())
      newTableOfContents.push(toEntry(heading))

    else
      newTableOfContents.push(oldHeading)
  }
  return newTableOfContents
}

/**
 * Returns the updated table of contents, placing the given `heading` before the given `prevHeading`. If `prevHeading`
 * is undefined, `heading` is placed at the start of table of contents
 */
function $updateHeadingPosition(
  prevHeading: HeadingNode | null,
  heading: HeadingNode,
  currentTableOfContents: Array<TableOfContentsEntry>,
): Array<TableOfContentsEntry> {
  const newTableOfContents: Array<TableOfContentsEntry> = []
  const newEntry: TableOfContentsEntry = toEntry(heading)

  if (!prevHeading)
    newTableOfContents.push(newEntry)

  for (const oldHeading of currentTableOfContents) {
    if (oldHeading[0] === heading.getKey())
      continue

    newTableOfContents.push(oldHeading)
    if (prevHeading && oldHeading[0] === prevHeading.getKey())
      newTableOfContents.push(newEntry)
  }

  return newTableOfContents
}

function $getPreviousHeading(node: HeadingNode): HeadingNode | null {
  let prevHeading = $getNextRightPreorderNode(node)
  while (prevHeading !== null && !$isHeadingNode(prevHeading))
    prevHeading = $getNextRightPreorderNode(prevHeading)

  return prevHeading
}

export function useTableOfContents(editor: LexicalEditor) {
  const tableOfContents = ref<Array<TableOfContentsEntry>>([])
  // Set table of contents initial state
  editor.getEditorState().read(() => {
    const root = $getRoot()
    const rootChildren = root.getChildren()
    for (const child of rootChildren) {
      if ($isHeadingNode(child)) {
        tableOfContents.value.push([
          child.getKey(),
          child.getTextContent(),
          child.getTag(),
        ])
      }
    }
  })

  const removeRootUpdateListener = editor.registerUpdateListener(
    ({ editorState, dirtyElements }) => {
      editorState.read(() => {
        const updateChildHeadings = (node: ElementNode) => {
          for (const child of node.getChildren()) {
            if ($isHeadingNode(child)) {
              const prevHeading = $getPreviousHeading(child)
              tableOfContents.value = $updateHeadingPosition(
                prevHeading,
                child,
                tableOfContents.value,
              )
            }
            else if ($isElementNode(child)) {
              updateChildHeadings(child)
            }
          }
        }

        // If a node is changes, all child heading positions need to be updated
        $getRoot()
          .getChildren()
          .forEach((node) => {
            if ($isElementNode(node) && dirtyElements.get(node.__key))
              updateChildHeadings(node)
          })
      })
    },
  )

  // Listen to updates to heading mutations and update state
  const removeHeaderMutationListener = editor.registerMutationListener(
    HeadingNode,
    (mutatedNodes: Map<string, NodeMutation>) => {
      editor.getEditorState().read(() => {
        for (const [nodeKey, mutation] of mutatedNodes) {
          if (mutation === 'created') {
            const newHeading = $getNodeByKey<HeadingNode>(nodeKey)
            if (newHeading !== null) {
              const prevHeading = $getPreviousHeading(newHeading)
              tableOfContents.value = $insertHeadingIntoTableOfContents(
                prevHeading,
                newHeading,
                tableOfContents.value,
              )
            }
          }
          else if (mutation === 'destroyed') {
            tableOfContents.value = $deleteHeadingFromTableOfContents(
              nodeKey,
              tableOfContents.value,
            )
          }
          else if (mutation === 'updated') {
            const newHeading = $getNodeByKey<HeadingNode>(nodeKey)
            if (newHeading !== null) {
              const prevHeading = $getPreviousHeading(newHeading)
              tableOfContents.value = $updateHeadingPosition(
                prevHeading,
                newHeading,
                tableOfContents.value,
              )
            }
          }
        }
      })
    },
  )

  // Listen to text node mutation updates
  const removeTextNodeMutationListener = editor.registerMutationListener(
    TextNode,
    (mutatedNodes: Map<string, NodeMutation>) => {
      editor.getEditorState().read(() => {
        for (const [nodeKey, mutation] of mutatedNodes) {
          if (mutation === 'updated') {
            const currNode = $getNodeByKey(nodeKey)
            if (currNode !== null) {
              const parentNode = currNode.getParentOrThrow()
              if ($isHeadingNode(parentNode)) {
                tableOfContents.value = $updateHeadingInTableOfContents(
                  parentNode,
                  tableOfContents.value,
                )
              }
            }
          }
        }
      })
    },
  )

  useMounted(() => mergeRegister(
    removeRootUpdateListener,
    removeHeaderMutationListener,
    removeTextNodeMutationListener,
  ))

  return tableOfContents
}
