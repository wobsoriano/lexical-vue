import type { CommandListenerPriority, LexicalCommand, LexicalEditor, TextNode } from 'lexical'
import type { Component, ComponentPublicInstance, Ref } from 'vue'
import { CAN_USE_DOM, mergeRegister } from '@lexical/utils'
import { $getSelection, $isRangeSelection, createCommand, KEY_ARROW_DOWN_COMMAND, KEY_ARROW_UP_COMMAND, KEY_ENTER_COMMAND, KEY_ESCAPE_COMMAND, KEY_TAB_COMMAND } from 'lexical'
import { computed, onUnmounted, ref, watch, watchEffect } from 'vue'
import { useLexicalComposer } from '../LexicalComposer.vine'

export type MenuRenderFn<TOption extends MenuOption> = (
  anchorElementRef: Ref<HTMLElement | null>,
  itemProps: {
    selectedIndex: number | null
    selectOptionAndCleanUp: (option: TOption) => void
    setHighlightedIndex: (index: number) => void
    options: Array<TOption>
  },
  matchingString: string | null,
) => Component | null

export interface MenuTextMatch {
  leadOffset: number
  matchingString: string
  replaceableString: string
}

export interface MenuResolution {
  match?: MenuTextMatch
  getRect: () => DOMRect
}

export const PUNCTUATION
  = '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_:;'

export class MenuOption {
  key: string
  ref: HTMLElement | null

  constructor(key: string) {
    this.key = key
    this.ref = null
    this.setRefElement = this.setRefElement.bind(this)
  }

  setRefElement(el: Element | ComponentPublicInstance | null) {
    this.ref = el as HTMLElement
  }
}

export interface MenuRenderProps<TOption extends MenuOption> {
  anchorElementRef: HTMLElement | null
  itemProps: {
    selectedIndex: number | null
    selectOptionAndCleanUp: (option: TOption) => void
    setHighlightedIndex: (index: number) => void
    options: Array<TOption>
  }
  matchingString: string | null
}

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

function isTriggerVisibleInNearestScrollContainer(
  targetElement: HTMLElement,
  containerElement: HTMLElement,
): boolean {
  const tRect = targetElement.getBoundingClientRect()
  const cRect = containerElement.getBoundingClientRect()
  return tRect.top > cRect.top && tRect.top < cRect.bottom
}

// Reposition the menu on scroll, window resize, and element resize.
export function useDynamicPositioning(
  resolution: Ref<MenuResolution | null>,
  targetElement: Ref<HTMLElement | null>,
  onReposition: () => void,
  onVisibilityChange?: (isInView: boolean) => void,
) {
  const editor = useLexicalComposer()

  watchEffect((onInvalidate) => {
    if (targetElement.value != null && resolution.value != null) {
      const rootElement = editor.getRootElement()
      const rootScrollParent
        = rootElement != null
          ? getScrollParent(rootElement, false)
          : document.body
      let ticking = false
      let previousIsInView = isTriggerVisibleInNearestScrollContainer(
        targetElement.value,
        rootScrollParent,
      )
      const handleScroll = function () {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            onReposition()
            ticking = false
          })
          ticking = true
        }
        const isInView = isTriggerVisibleInNearestScrollContainer(
          targetElement.value!,
          rootScrollParent,
        )
        if (isInView !== previousIsInView) {
          previousIsInView = isInView
          if (onVisibilityChange != null)
            onVisibilityChange(isInView)
        }
      }
      const resizeObserver = new ResizeObserver(onReposition)
      window.addEventListener('resize', onReposition)
      document.addEventListener('scroll', handleScroll, {
        capture: true,
        passive: true,
      })
      resizeObserver.observe(targetElement.value)
      onInvalidate(() => {
        resizeObserver.unobserve(targetElement.value!)
        window.removeEventListener('resize', onReposition)
        document.removeEventListener('scroll', handleScroll, true)
      })
    }
  })
}

function setContainerDivAttributes(
  containerDiv: HTMLElement,
  className?: string,
) {
  if (className != null) {
    containerDiv.className = className
  }
  containerDiv.setAttribute('aria-label', 'Typeahead menu')
  containerDiv.setAttribute('role', 'listbox')
  containerDiv.style.display = 'block'
  containerDiv.style.position = 'absolute'
}

export const SCROLL_TYPEAHEAD_OPTION_INTO_VIEW_COMMAND: LexicalCommand<{
  index: number
  option: MenuOption
}> = createCommand('SCROLL_TYPEAHEAD_OPTION_INTO_VIEW_COMMAND')

export function useMenuAnchorRef(
  resolution: Ref<MenuResolution | null>,
  setResolution: (r: MenuResolution | null) => void,
  className?: string,
  parent: HTMLElement | undefined = CAN_USE_DOM ? document.body : undefined,
  shouldIncludePageYOffset__EXPERIMENTAL: boolean = true,
): Ref<HTMLElement | null> {
  const editor = useLexicalComposer()
  const initialAnchorElement = CAN_USE_DOM ? document.createElement('div') : null
  const anchorElementRef = ref<HTMLElement | null>(initialAnchorElement)
  const positionMenu = () => {
    if (anchorElementRef.value === null || parent === undefined) {
      return
    }

    anchorElementRef.value.style.top = anchorElementRef.value.style.bottom
    const rootElement = editor.getRootElement()
    const containerDiv = anchorElementRef.value

    const menuEle = containerDiv.firstElementChild as HTMLElement
    if (rootElement !== null && resolution.value !== null) {
      const { left, top, width, height } = resolution.value.getRect()
      const anchorHeight = anchorElementRef.value.offsetHeight // use to position under anchor
      containerDiv.style.top = `${
        top + (shouldIncludePageYOffset__EXPERIMENTAL ? window.pageYOffset : 0)
        + anchorHeight + 3
      }px`
      containerDiv.style.left = `${left + window.pageXOffset}px`
      containerDiv.style.height = `${height}px`
      containerDiv.style.width = `${width}px`
      if (menuEle !== null) {
        menuEle.style.top = `${top}`
        const menuRect = menuEle.getBoundingClientRect()
        const menuHeight = menuRect.height
        const menuWidth = menuRect.width

        const rootElementRect = rootElement.getBoundingClientRect()

        if (left + menuWidth > rootElementRect.right) {
          containerDiv.style.left = `${
            rootElementRect.right - menuWidth + window.pageXOffset
          }px`
        }
        if (
          (top + menuHeight > window.innerHeight
            || top + menuHeight > rootElementRect.bottom)
          && top - rootElementRect.top > menuHeight + height
        ) {
          containerDiv.style.top = `${
            top - menuHeight + (shouldIncludePageYOffset__EXPERIMENTAL ? window.pageYOffset : 0)
            - height
          }px`
        }
      }

      if (!containerDiv.isConnected) {
        setContainerDivAttributes(containerDiv, className)
        parent.append(containerDiv)
      }
      containerDiv.setAttribute('id', 'typeahead-menu')
      rootElement.setAttribute('aria-controls', 'typeahead-menu')
    }
  }

  watchEffect(() => {
    const rootElement = editor.getRootElement()
    if (resolution.value !== null) {
      positionMenu()
      return () => {
        if (rootElement !== null)
          rootElement.removeAttribute('aria-controls')

        const containerDiv = anchorElementRef.value
        if (containerDiv !== null && containerDiv.isConnected) {
          containerDiv.remove()
          containerDiv.removeAttribute('id')
        }
      }
    }
  })

  const onVisibilityChange = (isInView: boolean) => {
    if (resolution.value !== null) {
      if (!isInView)
        setResolution(null)
    }
  }

  useDynamicPositioning(
    resolution,
    anchorElementRef,
    positionMenu,
    onVisibilityChange,
  )

  return anchorElementRef
}

export type TriggerFn = (
  text: string,
  editor: LexicalEditor,
) => MenuTextMatch | null

interface LexicalMenuProps<TOption extends MenuOption> {
  close: () => void
  editor: LexicalEditor
  anchorElementRef: HTMLElement
  resolution: MenuResolution
  options: Array<TOption>
  shouldSplitNodeWithQuery?: boolean
  commandPriority?: CommandListenerPriority
}

export function LexicalMenu<TOption extends MenuOption>(props: LexicalMenuProps<TOption>) {
  const selectedIndex = ref<number | null>(null)
  const matchString = computed(() => props.resolution.match && props.resolution.match.matchingString)

  const emit = vineEmits<{
    selectOption: [payload: {
      option: TOption
      textNodeContainingQuery: TextNode | null
      closeMenu: () => void
      matchingString: string
    }]
  }>()

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

  // Can't use MenuRenderProps directly, vue-vine wants an object literal
  vineSlots<{
    default: (props: {
      anchorElementRef: MenuRenderProps<TOption>['anchorElementRef']
      itemProps: MenuRenderProps<TOption>['itemProps']
      matchingString: MenuRenderProps<TOption>['matchingString']
    }) => any
  }>()

  return vine`
    <slot
    :item-props="{
      options,
      selectOptionAndCleanUp,
      selectedIndex,
      setHighlightedIndex,
    }"
    :anchor-element-ref="anchorElementRef"
    :matching-string="resolution.match ? resolution.match.matchingString : ''"
  />
  `
}
