import type { LexicalEditor } from 'lexical'
import type { Ref } from 'vue'
import { ref, unref } from 'vue'
import type { MaybeRef } from '../types'
import { useEditor } from './useEditor'
import { useEffect } from './useEffect'

export type TriggerFn = (
  text: string,
  editor: LexicalEditor,
) => QueryMatch | null

export const PUNCTUATION
  = '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_:;'

export class TypeaheadOption {
  key: string
  elRef?: Ref<HTMLElement | null>

  constructor(key: string) {
    this.key = key
    if (this.elRef)
      this.elRef.value = null
    this.setRefElement = this.setRefElement.bind(this)
  }

  setRefElement(element: HTMLElement | null) {
    if (this.elRef)
      this.elRef.value = element
  }
}

export function useBasicTypeaheadTriggerMatch(
  trigger: string,
  { minLength = 1, maxLength = 75 }: { minLength?: number; maxLength?: number },
): TriggerFn {
  return (text: string) => {
    const validChars = `[^${trigger}${PUNCTUATION}\\s]`
    const TypeaheadTriggerRegex = new RegExp(
      '(^|\\s|\\()('
        + `[${
        trigger
        }]`
        + `((?:${
        validChars
        }){0,${
        maxLength
        }})`
        + ')$',
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

export function useMenuAnchorRef(
  resolution: MaybeRef<Resolution | null>,
  setResolution: (r: Resolution | null) => void,
  className?: string,
): Ref<HTMLElement> {
  const editor = useEditor()
  const anchorElementRef = ref<HTMLElement>(document.createElement('div'))
  const positionMenu = () => {
    const rootElement = editor.getRootElement()
    const containerDiv = anchorElementRef.value

    if (rootElement !== null && unref(resolution) !== null) {
      const { left, top, width, height } = unref(resolution as Resolution).getRect()
      containerDiv.style.top = `${top + window.pageYOffset}px`
      containerDiv.style.left = `${left + window.pageXOffset}px`
      containerDiv.style.height = `${height}px`
      containerDiv.style.width = `${width}px`

      if (!containerDiv.isConnected) {
        if (className)
          containerDiv.className = className

        containerDiv.setAttribute('aria-label', 'Typeahead menu')
        containerDiv.setAttribute('id', 'typeahead-menu')
        containerDiv.setAttribute('role', 'listbox')
        containerDiv.style.display = 'block'
        containerDiv.style.position = 'absolute'
        document.body.append(containerDiv)
      }
      anchorElementRef.value = containerDiv
      rootElement.setAttribute('aria-controls', 'typeahead-menu')
    }
  }

  useEffect(() => {
    const rootElement = editor.getRootElement()
    if (unref(resolution) !== null) {
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
    if (unref(resolution) !== null) {
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

export interface QueryMatch {
  leadOffset: number
  matchingString: string
  replaceableString: string
}

export interface Resolution {
  match: QueryMatch
  getRect: () => DOMRect
}

// Got from https://stackoverflow.com/a/42543908/2013580
function getScrollParent(
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
) {
  const tRect = targetElement.getBoundingClientRect()
  const cRect = containerElement.getBoundingClientRect()
  return tRect.top > cRect.top && tRect.top < cRect.bottom
}

// Reposition the menu on scroll, window resize, and element resize.
export function useDynamicPositioning(
  resolution: MaybeRef<Resolution | null>,
  targetElement: MaybeRef<HTMLElement | null>,
  onReposition: () => void,
  onVisibilityChange?: (isInView: boolean) => void,
) {
  const editor = useEditor()
  useEffect(() => {
    if (unref(targetElement) !== null && unref(resolution) !== null) {
      const rootElement = editor.getRootElement()
      const rootScrollParent
        = rootElement !== null
          ? getScrollParent(rootElement, false)
          : document.body
      let ticking = false
      let previousIsInView = isTriggerVisibleInNearestScrollContainer(
        unref(targetElement as MaybeRef<HTMLElement>),
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
          unref(targetElement as MaybeRef<HTMLElement>),
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
      resizeObserver.observe(unref(targetElement as MaybeRef<Element>))
      return () => {
        resizeObserver.unobserve(unref(targetElement as MaybeRef<Element>))
        window.removeEventListener('resize', onReposition)
        document.removeEventListener('scroll', handleScroll)
      }
    }
  })
}
