import type {
  LexicalCommand,
  LexicalEditor,
} from 'lexical'
import {
  createCommand,
} from 'lexical'
import type { Component, ComponentPublicInstance, Ref } from 'vue'
import { ref, watchEffect } from 'vue'
import { useLexicalComposer } from '../../composables'

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

export const SCROLL_TYPEAHEAD_OPTION_INTO_VIEW_COMMAND: LexicalCommand<{
  index: number
  option: MenuOption
}> = createCommand('SCROLL_TYPEAHEAD_OPTION_INTO_VIEW_COMMAND')

export function useMenuAnchorRef(
  resolution: Ref<MenuResolution | null>,
  setResolution: (r: MenuResolution | null) => void,
  className?: string,
  parent: HTMLElement = document.body,
): Ref<HTMLElement> {
  const editor = useLexicalComposer()
  const anchorElementRef = ref<HTMLElement>(document.createElement('div'))
  const positionMenu = () => {
    anchorElementRef.value.style.top = anchorElementRef.value.style.bottom
    const rootElement = editor.getRootElement()
    const containerDiv = anchorElementRef.value

    const menuEle = containerDiv.firstChild as HTMLElement
    if (rootElement !== null && resolution.value !== null) {
      const { left, top, width, height } = resolution.value!.getRect()
      const anchorHeight = anchorElementRef.value.offsetHeight // use to position under anchor
      containerDiv.style.top = `${
        top + window.scrollY + anchorHeight + 3
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
          && top - rootElementRect.top > menuHeight
        ) {
          containerDiv.style.top = `${
            top - menuHeight + window.pageYOffset - height
          }px`
        }
      }

      if (!containerDiv.isConnected) {
        if (className != null)
          containerDiv.className = className

        containerDiv.setAttribute('aria-label', 'Typeahead menu')
        containerDiv.setAttribute('id', 'typeahead-menu')
        containerDiv.setAttribute('role', 'listbox')
        containerDiv.style.display = 'block'
        containerDiv.style.position = 'absolute'
        parent.append(containerDiv)
      }
      anchorElementRef.value = containerDiv
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
        if (containerDiv !== null && containerDiv.isConnected)
          containerDiv.remove()
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
