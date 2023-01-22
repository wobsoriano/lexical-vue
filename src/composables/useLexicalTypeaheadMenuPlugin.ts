import type { TextNode } from 'lexical'
import type { VNode } from 'vue'
import { defineComponent, h } from 'vue'
import LexicalTypeaheadMenuPlugin from '../components/LexicalTypeaheadMenuPlugin.vue'
import type { TypeaheadOption } from './typeaheadMenu'

type ExtractComponentProps<TComponent> =
  TComponent extends new () => {
    $props: infer P
  }
    ? P
    : never

interface Props<Option extends TypeaheadOption> extends Omit<ExtractComponentProps<typeof LexicalTypeaheadMenuPlugin>, 'options' | 'onSelectOption'> {
  options: Option[]
}

export function useLexicalTypeaheadMenuPlugin<Option extends TypeaheadOption>() {
  const wrapper = defineComponent((
    props: Props<Option>,
    { slots }) => {
    return () => h(LexicalTypeaheadMenuPlugin, props, slots)
  })

  return wrapper as typeof wrapper & {
    new (): {
      $emit: {
        (e: 'selectOption', payload: {
          close: () => void
          option: Option
          textNodeContainingQuery: TextNode | null
          matchingString: string
        }): void
      }
      $slots: {
        default: (arg: {
          listItemProps: {
            options: Option[]
            selectOptionAndCleanUp: (selectedEntry: Option) => void
            selectedIndex: number | null
            setHighlightedIndex: (index: number) => void
          }
          anchorElementRef: HTMLElement
          matchString: string
        }) => VNode[]
      }
    }
  }
}
