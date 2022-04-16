import type { ElementNode, LexicalEditor, LexicalNode } from 'lexical'
import { $createTextNode, $isElementNode, $isLineBreakNode, $isTextNode, TextNode } from 'lexical'
import { $createAutoLinkNode, $isAutoLinkNode, $isLinkNode, AutoLinkNode } from '@lexical/link'
import { onUnmounted, watchEffect } from 'vue'
import { mergeRegister } from '@lexical/utils'

interface LinkMatcherResult {
  index: number
  length: number
  text: string
  url: string
}

export type LinkMatcher = (text: string) => LinkMatcherResult | null

type ChangeHandler = (url: string | null, prevUrl: string | null) => void

function replaceWithChildren(node: ElementNode): LexicalNode[] {
  const children = node.getChildren()
  const childrenLength = children.length
  for (let j = childrenLength - 1; j >= 0; j--)
    node.insertAfter(children[j])

  node.remove()
  return children.map(child => child.getLatest())
}

function handleLinkEdit(
  linkNode: AutoLinkNode,
  matchers: Array<LinkMatcher>,
  onChange: ChangeHandler,
): void {
  // Check children are simple text
  // @ts-expect-error: TODO: Internal lexical types
  const children = linkNode.getChildren()
  const childrenLength = children.length
  for (let i = 0; i < childrenLength; i++) {
    const child = children[i]
    if (!$isTextNode(child) || !child.isSimpleText()) {
      // @ts-expect-error: TODO: Internal lexical types
      replaceWithChildren(linkNode)
      onChange(null, linkNode.getURL())
      return
    }
  }

  // Check text content fully matches
  // @ts-expect-error: TODO: Internal lexical types
  const text = linkNode.getTextContent()
  const match = findFirstMatch(text, matchers)
  if (match === null || match.text !== text) {
    // @ts-expect-error: TODO: Internal lexical types
    replaceWithChildren(linkNode)
    onChange(null, linkNode.getURL())
    return
  }

  // Check neighbors
  // @ts-expect-error: TODO: Internal lexical types
  if (!isPreviousNodeValid(linkNode) || !isNextNodeValid(linkNode)) {
    // @ts-expect-error: TODO: Internal lexical types
    replaceWithChildren(linkNode)
    onChange(null, linkNode.getURL())
    return
  }

  const url = linkNode.getURL()
  if (match !== null && url !== match.url) {
    linkNode.setURL(match.url)
    onChange(match.url, url)
  }
}

let unregisterListener: () => void

export function useAutoLink(
  editor: LexicalEditor,
  matchers: Array<LinkMatcher>,
  onChange?: ChangeHandler,
): void {
  watchEffect(() => {
    if (!editor.hasNodes([AutoLinkNode])) {
      throw new Error(
        'LexicalAutoLinkPlugin: AutoLinkNode, TableCellNode or TableRowNode not registered on editor',
      )
    }

    // @ts-expect-error: TODO: Internal lexical types
    const onChangeWrapped = (...args) => {
      if (onChange) {
        // @ts-expect-error: TODO: Internal lexical types
        onChange(...args)
      }
    }

    unregisterListener = mergeRegister(
      editor.registerNodeTransform(TextNode, (textNode: TextNode) => {
        const parent = textNode.getParentOrThrow()
        if ($isAutoLinkNode(parent)) {
          // @ts-expect-error: TODO: Internal lexical types
          handleLinkEdit(parent, matchers, onChangeWrapped)
        }
        else if (!$isLinkNode(parent)) {
          if (textNode.isSimpleText())
            handleLinkCreation(textNode, matchers, onChangeWrapped)

          handleBadNeighbors(textNode, onChangeWrapped)
        }
      }),
      // @ts-expect-error: TODO: Internal lexical types
      editor.registerNodeTransform(AutoLinkNode, (linkNode: AutoLinkNode) => {
        handleLinkEdit(linkNode, matchers, onChangeWrapped)
      }),
    )
  })

  onUnmounted(() => {
    unregisterListener?.()
  })
}

function findFirstMatch(
  text: string,
  matchers: Array<LinkMatcher>,
): LinkMatcherResult | null {
  for (let i = 0; i < matchers.length; i++) {
    const match = matchers[i](text)
    if (match)
      return match
  }
  return null
}

function isPreviousNodeValid(node: LexicalNode): boolean {
  let previousNode = node.getPreviousSibling()
  if ($isElementNode(previousNode)) {
    // @ts-expect-error: TODO: Internal lexical types
    previousNode = previousNode.getLastDescendant()
  }

  return (
    previousNode === null
    || $isLineBreakNode(previousNode)
    || ($isTextNode(previousNode) && previousNode.getTextContent().endsWith(' '))
  )
}

function isNextNodeValid(node: LexicalNode): boolean {
  let nextNode = node.getNextSibling()
  if ($isElementNode(nextNode)) {
    // @ts-expect-error: TODO: Internal lexical types
    nextNode = nextNode.getFirstDescendant()
  }

  return (
    nextNode === null
    || $isLineBreakNode(nextNode)
    || ($isTextNode(nextNode) && nextNode.getTextContent().startsWith(' '))
  )
}

function handleLinkCreation(
  node: TextNode,
  matchers: Array<LinkMatcher>,
  onChange: ChangeHandler,
): void {
  const nodeText = node.getTextContent()
  const nodeTextLength = nodeText.length
  let text = nodeText
  let textOffset = 0
  let lastNode = node
  let match
  // eslint-disable-next-line no-cond-assign
  while ((match = findFirstMatch(text, matchers)) && match !== null) {
    const matchOffset = match.index
    const offset = textOffset + matchOffset
    const matchLength = match.length

    // Previous node is valid if any of:
    // 1. Space before same node
    // 2. Space in previous simple text node
    // 3. Previous node is LineBreakNode
    let contentBeforeMatchIsValid
    if (offset > 0)
      contentBeforeMatchIsValid = nodeText[offset - 1] === ' '

    else
      contentBeforeMatchIsValid = isPreviousNodeValid(node)

    // Next node is valid if any of:
    // 1. Space after same node
    // 2. Space in next simple text node
    // 3. Next node is LineBreakNode
    let contentAfterMatchIsValid
    if (offset + matchLength < nodeTextLength)
      contentAfterMatchIsValid = nodeText[offset + matchLength] === ' '

    else
      contentAfterMatchIsValid = isNextNodeValid(node)

    if (contentBeforeMatchIsValid && contentAfterMatchIsValid) {
      let middleNode

      if (matchOffset === 0) {
        [middleNode, lastNode] = lastNode.splitText(matchLength)
      }
      else {
        [, middleNode, lastNode] = lastNode.splitText(
          matchOffset,
          matchOffset + matchLength,
        )
      }
      const linkNode = $createAutoLinkNode(match.url)
      // @ts-expect-error: TODO: Internal lexical types
      linkNode.append($createTextNode(match.text))
      // @ts-expect-error: TODO: Internal lexical types
      middleNode.replace(linkNode)
      onChange(match.url, null)
    }

    const iterationOffset = matchOffset + matchLength
    text = text.substring(iterationOffset)
    textOffset += iterationOffset
  }
}

// Bad neighbours are edits in neighbor nodes that make AutoLinks incompatible.
// Given the creation preconditions, these can only be simple text nodes.
function handleBadNeighbors(textNode: TextNode, onChange: ChangeHandler): void {
  const previousSibling = textNode.getPreviousSibling()
  const nextSibling = textNode.getNextSibling()
  const text = textNode.getTextContent()
  if ($isAutoLinkNode(previousSibling) && !text.startsWith(' ')) {
    // @ts-expect-error: TODO: Internal lexical types
    replaceWithChildren(previousSibling)
    // @ts-expect-error: TODO: Internal lexical types
    onChange(null, previousSibling.getURL())
  }
  if ($isAutoLinkNode(nextSibling) && !text.endsWith(' ')) {
    // @ts-expect-error: TODO: Internal lexical types
    replaceWithChildren(nextSibling)
    // @ts-expect-error: TODO: Internal lexical types
    onChange(null, nextSibling.getURL())
  }
}
