import type {
  CommandListenerPriority,
  LexicalCommand,
  LexicalEditor,
  RangeSelection,
  TextNode,
} from 'lexical'
import type {
  MenuRenderProps,
  MenuResolution,
  MenuTextMatch,
  TriggerFn,
} from './shared/LexicalMenu.vine'
import { getScrollParent as getScrollParent_ } from '@lexical/utils'
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  createCommand,
  getDOMSelection,
  getDOMSelectionPoints,
} from 'lexical'
import { computed, getCurrentInstance, nextTick, onUpdated, ref, watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'
import { LexicalMenu, MenuOption, useMenuAnchorRef } from './shared/LexicalMenu.vine'

export const PUNCTUATION = '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_:;'

/** @deprecated Moved to `@lexical/utils`. Import `getScrollParent` from there. */
export const getScrollParent = getScrollParent_

export { useDynamicPositioning } from './shared/LexicalMenu.vine'

export const SCROLL_TYPEAHEAD_OPTION_INTO_VIEW_COMMAND: LexicalCommand<{
  index: number
  option: MenuOption
}> = createCommand('SCROLL_TYPEAHEAD_OPTION_INTO_VIEW_COMMAND')

export function useBasicTypeaheadTriggerMatch(
  trigger: string,
  {
    minLength = 1,
    maxLength = 75,
    punctuation = PUNCTUATION,
    allowWhitespace = false,
  }: { minLength?: number; maxLength?: number; punctuation?: string; allowWhitespace?: boolean },
): TriggerFn {
  return (text: string) => {
    const validCharsSuffix = allowWhitespace ? '' : '\\s'
    const validChars = `[^${trigger}${punctuation}${validCharsSuffix}]`
    const TypeaheadTriggerRegex = new RegExp(
      `(^|\\s|\\()(` + `[${trigger}]` + `((?:${validChars}){0,${maxLength}})` + `)$`,
    )
    const match = TypeaheadTriggerRegex.exec(text)
    if (match !== null) {
      const maybeLeadingWhitespace = match[1]
      const matchingString = match[3]
      if (matchingString.length >= minLength) {
        return {
          leadOffset: match.index + maybeLeadingWhitespace.length,
          matchingString,
          replaceableString: match[2],
        }
      }
    }
    return null
  }
}

export interface TypeaheadMenuPluginProps<TOption extends MenuOption> {
  options: Array<TOption>
  // TODO: Can't use TriggerFn below, giving RangeError: Maximum call stack size exceeded
  triggerFn: (text: string, editor: LexicalEditor) => MenuTextMatch | null
  anchorClassName?: string
  commandPriority?: CommandListenerPriority
  parent?: HTMLElement
  preselectFirstItem?: boolean
  ignoreEntityBoundary?: boolean
}

export type { MenuResolution, MenuTextMatch, TriggerFn }

export { MenuOption }

export function TypeaheadMenuPlugin<TOption extends MenuOption>(
  props: TypeaheadMenuPluginProps<TOption>,
) {
  const instance = getCurrentInstance()
  const hasPreselectFirstItem = ref(hasPreselectFirstItemProp())

  function hasPreselectFirstItemProp() {
    const vnodeProps = instance?.vnode.props
    return (
      vnodeProps != null &&
      ('preselectFirstItem' in vnodeProps || 'preselect-first-item' in vnodeProps)
    )
  }

  onUpdated(() => {
    hasPreselectFirstItem.value = hasPreselectFirstItemProp()
  })

  const shouldPreselectFirstItem = computed(() =>
    hasPreselectFirstItem.value ? props.preselectFirstItem : true,
  )
  const editor = useLexicalComposer()
  const resolution = ref<MenuResolution | null>(null)

  const emit = vineEmits<{
    close?: []
    open?: [payload: MenuResolution]
    queryChange: [payload: string | null]
    selectOption: [
      payload: {
        option: TOption
        textNodeContainingQuery: TextNode | null
        closeMenu: () => void
        matchingString: string
      },
    ]
  }>()

  function setResolution(payload: MenuResolution | null) {
    resolution.value = payload
  }

  const anchorElementRef = useMenuAnchorRef(
    resolution,
    setResolution,
    props.anchorClassName,
    props.parent,
  )

  function closeTypeahead() {
    if (resolution.value === null) {
      return
    }

    const finish = () => setResolution(null)
    const onClose = instance?.vnode.props?.onClose as
      | (() => void | PromiseLike<void>)
      | Array<() => void | PromiseLike<void>>
      | undefined
    let result: PromiseLike<unknown> | null = null
    try {
      if (Array.isArray(onClose)) {
        result = Promise.all(onClose.map((listener) => listener()))
      } else {
        result = onClose?.() ?? null
      }
    } finally {
      if (result) {
        result.then(finish, finish)
      } else {
        finish()
      }
    }
  }

  function openTypeahead(res: MenuResolution) {
    const wasClosed = resolution.value === null
    setResolution(res)
    if (wasClosed) emit('open', res)
  }

  function getTextUpToAnchor(selection: RangeSelection): string | null {
    const anchor = selection.anchor
    if (anchor.type !== 'text') return null

    const anchorNode = anchor.getNode()
    if (!anchorNode.isSimpleText()) return null

    const anchorOffset = anchor.offset
    return anchorNode.getTextContent().slice(0, anchorOffset)
  }

  function tryToPositionRange(
    leadOffset: number,
    range: Range,
    editorWindow: Window,
    rootElement: HTMLElement | null,
  ): boolean {
    const domSelection = getDOMSelection(editorWindow)
    if (domSelection === null || !domSelection.isCollapsed) return false

    const points = getDOMSelectionPoints(domSelection, rootElement)
    const anchorNode = points.anchorNode
    const startOffset = leadOffset
    const endOffset = points.anchorOffset

    if (anchorNode == null || endOffset == null) return false

    try {
      range.setStart(anchorNode, startOffset)
      range.setEnd(anchorNode, endOffset)
    } catch {
      return false
    }

    return true
  }

  function getQueryTextForSearch(editor: LexicalEditor): string | null {
    let text = null
    editor.read('latest', () => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      text = getTextUpToAnchor(selection)
    })
    return text
  }

  function isSelectionOnEntityBoundary(editor: LexicalEditor, offset: number): boolean {
    if (offset !== 0) return false

    return editor.read('latest', () => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor
        const anchorNode = anchor.getNode()
        const prevSibling = anchorNode.getPreviousSibling()
        return $isTextNode(prevSibling) && prevSibling.isTextEntity()
      }
      return false
    })
  }

  watchEffect((onInvalidate) => {
    const updateListener = () => {
      // Check if editor is in read-only mode
      editor.read('latest', () => {
        if (!editor.isEditable()) {
          closeTypeahead()
          return
        }

        if (editor.isComposing()) {
          return
        }

        const editorWindow = editor._window || window
        const range = editorWindow.document.createRange()
        const selection = $getSelection()
        const text = getQueryTextForSearch(editor)

        if (
          !$isRangeSelection(selection) ||
          !selection.isCollapsed() ||
          text === null ||
          range === null
        ) {
          closeTypeahead()
          return
        }

        const match = props.triggerFn(text, editor)
        emit('queryChange', match ? match.matchingString : null)

        if (
          match !== null &&
          (props.ignoreEntityBoundary || !isSelectionOnEntityBoundary(editor, match.leadOffset))
        ) {
          const isRangePositioned = tryToPositionRange(
            match.leadOffset,
            range,
            editorWindow,
            editor.getRootElement(),
          )
          if (isRangePositioned) {
            nextTick(() =>
              openTypeahead({
                getRect: () => range.getBoundingClientRect(),
                match,
              }),
            )
            return
          }
        }
        closeTypeahead()
      })
    }

    const removeUpdateListener = editor.registerUpdateListener(updateListener)

    onInvalidate(removeUpdateListener)
  })

  watchEffect((onInvalidate) => {
    const unregister = editor.registerEditableListener((isEditable) => {
      if (!isEditable) closeTypeahead()
    })

    onInvalidate(unregister)
  })

  vineSlots<{
    default: (props: MenuRenderProps<TOption>) => any
  }>()

  return vine`
    <LexicalMenu
      v-if="resolution !== null && editor !== null && anchorElementRef !== null"
      :anchor-element-ref
      :editor
      :resolution
      :options
      should-split-node-with-query
      :command-priority
      :preselect-first-item="shouldPreselectFirstItem"
      :close="closeTypeahead"
      @select-option="emit('selectOption', $event)"
      v-slot="slotProps"
    >
      <slot v-bind="slotProps as unknown as MenuRenderProps<TOption>" />
    </LexicalMenu>
  `
}
