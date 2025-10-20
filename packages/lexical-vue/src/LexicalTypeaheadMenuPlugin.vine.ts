import type {
  CommandListenerPriority,
  LexicalCommand,
  LexicalEditor,
  RangeSelection,
  TextNode,
} from 'lexical'
import type { MenuOption, MenuRenderProps, MenuResolution, MenuTextMatch, TriggerFn } from './shared/LexicalMenu.vine'
import { $getSelection, $isRangeSelection, $isTextNode, COMMAND_PRIORITY_LOW, createCommand } from 'lexical'
import { nextTick, ref, watchEffect } from 'vue'
import { useLexicalComposer } from './composables'
import { LexicalMenu, useMenuAnchorRef } from './shared/LexicalMenu.vine'

export const PUNCTUATION
  = '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_:;'

// Got from https://stackoverflow.com/a/42543908/2013580
export function getScrollParent(
  element: HTMLElement,
  includeHidden: boolean,
): HTMLElement | HTMLBodyElement {
  let style = getComputedStyle(element)
  const excludeStaticParent = style.position === 'absolute'
  const overflowRegex = includeHidden
    ? /(auto|scroll|hidden)/
    : /(auto|scroll)/
  if (style.position === 'fixed')
    return document.body

  for (
    let parent: HTMLElement | null = element;
    // eslint-disable-next-line no-cond-assign
    (parent = parent.parentElement);

  ) {
    style = getComputedStyle(parent)
    if (excludeStaticParent && style.position === 'static')
      continue

    if (
      overflowRegex.test(style.overflow + style.overflowY + style.overflowX)
    )
      return parent
  }
  return document.body
}

export { useDynamicPositioning } from './shared/LexicalMenu.vine'

export const SCROLL_TYPEAHEAD_OPTION_INTO_VIEW_COMMAND: LexicalCommand<{
  index: number
  option: MenuOption
}> = createCommand('SCROLL_TYPEAHEAD_OPTION_INTO_VIEW_COMMAND')

export function useBasicTypeaheadTriggerMatch(
  trigger: string,
  { minLength = 1, maxLength = 75, punctuation = PUNCTUATION, allowWhitespace = false }: { minLength?: number, maxLength?: number, punctuation?: string, allowWhitespace?: boolean },
): TriggerFn {
  return (text: string) => {
    const validCharsSuffix = allowWhitespace ? '' : '\\s'
    const validChars = `[^${trigger}${punctuation}${validCharsSuffix}]`
    const TypeaheadTriggerRegex = new RegExp(
      `(^|\\s|\\()(`
      + `[${
        trigger
      }]`
      + `((?:${
        validChars
      }){0,${
        maxLength
      }})`
      + `)$`,
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

export type { MenuOption, MenuResolution, MenuTextMatch, TriggerFn }

export function LexicalTypeaheadMenuPlugin<TOption extends MenuOption>(props: TypeaheadMenuPluginProps<TOption>) {
  const editor = useLexicalComposer()
  const resolution = ref<MenuResolution | null>(null)

  const emit = vineEmits<{
    close: []
    open: [payload: MenuResolution]
    queryChange: [payload: string | null]
    selectOption: [payload: {
      option: TOption
      textNodeContainingQuery: TextNode | null
      closeMenu: () => void
      matchingString: string
    }]
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
    setResolution(null)
    if (resolution.value !== null)
      emit('close')
  }

  function openTypeahead(res: MenuResolution) {
    setResolution(res)
    if (resolution.value === null)
      emit('open', res)
  }

  function getTextUpToAnchor(selection: RangeSelection): string | null {
    const anchor = selection.anchor
    if (anchor.type !== 'text')
      return null

    const anchorNode = anchor.getNode()
    if (!anchorNode.isSimpleText())
      return null

    const anchorOffset = anchor.offset
    return anchorNode.getTextContent().slice(0, anchorOffset)
  }

  function tryToPositionRange(
    leadOffset: number,
    range: Range,
    editorWindow: Window,
  ): boolean {
    const domSelection = editorWindow.getSelection()
    if (domSelection === null || !domSelection.isCollapsed)
      return false

    const anchorNode = domSelection.anchorNode
    const startOffset = leadOffset
    const endOffset = domSelection.anchorOffset

    if (anchorNode == null || endOffset == null)
      return false

    try {
      range.setStart(anchorNode, startOffset)
      range.setEnd(anchorNode, endOffset)
    }
    catch {
      return false
    }

    return true
  }

  function getQueryTextForSearch(editor: LexicalEditor): string | null {
    let text = null
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection))
        return

      text = getTextUpToAnchor(selection)
    })
    return text
  }

  function isSelectionOnEntityBoundary(
    editor: LexicalEditor,
    offset: number,
  ): boolean {
    if (offset !== 0)
      return false

    return editor.getEditorState().read(() => {
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
      editor.getEditorState().read(() => {
        if (!editor.isEditable()) {
          closeTypeahead()
          return
        }

        const editorWindow = editor._window || window
        const range = editorWindow.document.createRange()
        const selection = $getSelection()
        const text = getQueryTextForSearch(editor)

        if (
          !$isRangeSelection(selection)
          || !selection.isCollapsed()
          || text === null
          || range === null
        ) {
          closeTypeahead()
          return
        }

        const match = props.triggerFn(text, editor)
        emit('queryChange', match ? match.matchingString : null)

        if (
          match !== null
          && (props.ignoreEntityBoundary || !isSelectionOnEntityBoundary(editor, match.leadOffset))
        ) {
          const isRangePositioned = tryToPositionRange(
            match.leadOffset,
            range,
            editorWindow,
          )
          if (isRangePositioned !== null) {
            nextTick(() => openTypeahead({
              getRect: () => range.getBoundingClientRect(),
              match,
            }))
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
      if (!isEditable)
        closeTypeahead()
    })

    onInvalidate(unregister)
  })

  // Can't use MenuRenderProps directly, vue-vine wants an object literal
  vineSlots<{
    default: (props: {
      anchorElementRef: MenuRenderProps<TOption>['anchorElementRef']
      itemProps: MenuRenderProps<TOption>['itemProps']
      matchingString: MenuRenderProps<TOption>['matchingString']
    }) => any
  }>()

  return vine`
    <LexicalMenu
      v-if="resolution !== null && editor !== null && anchorElementRef !== null"
      :anchor-element-ref
      :editor
      :resolution
      :options
      should-split-node-with-query
      :command-priority="commandPriority ?? (COMMAND_PRIORITY_LOW as CommandListenerPriority)"
      :close="closeTypeahead"
      @select-option="emit('selectOption', $event)"
      v-slot="slotProps"
    >
      <slot v-bind="slotProps as unknown as MenuRenderProps<TOption>" />
    </LexicalMenu>
  `
}
