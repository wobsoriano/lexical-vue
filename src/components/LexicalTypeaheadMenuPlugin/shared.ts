import type {
  CommandListenerPriority,
  LexicalCommand,
} from 'lexical'
import {
  createCommand,
} from 'lexical'

import type {
  MenuOption,
  MenuRenderFn,
  MenuResolution,
  MenuTextMatch,
  TriggerFn,
} from '../LexicalMenu/shared'

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

export { useDynamicPositioning } from '../LexicalMenu/shared'

export const SCROLL_TYPEAHEAD_OPTION_INTO_VIEW_COMMAND: LexicalCommand<{
  index: number
  option: MenuOption
}> = createCommand('SCROLL_TYPEAHEAD_OPTION_INTO_VIEW_COMMAND')

export function useBasicTypeaheadTriggerMatch(
  trigger: string,
  { minLength = 1, maxLength = 75 }: { minLength?: number, maxLength?: number },
): TriggerFn {
  return (text: string) => {
    const validChars = `[^${trigger}${PUNCTUATION}\\s]`
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
  triggerFn: TriggerFn
  anchorClassName?: string
  commandPriority?: CommandListenerPriority
  parent?: HTMLElement
}

export { MenuOption, MenuRenderFn, MenuResolution, MenuTextMatch, TriggerFn }
