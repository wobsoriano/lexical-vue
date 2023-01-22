import { defineComponent, h } from 'vue'
import LexicalTypeaheadMenuPlugin from '../components/LexicalTypeaheadMenuPlugin.vue'
import type { TypeaheadOption } from './typeaheadMenu'

type ExtractComponentProps<TComponent> =
  TComponent extends new () => {
    $props: infer P
  }
    ? P
    : never

interface Props<Option extends TypeaheadOption> extends Omit<ExtractComponentProps<typeof LexicalTypeaheadMenuPlugin>, 'options'> {
  options: Option[]
}

export function useLexicalTypeaheadMenuPlugin<Option extends TypeaheadOption>() {
  const wrapper = defineComponent((
    props: Props<Option>,
    { slots }) => {
    return () => h(LexicalTypeaheadMenuPlugin as any, props, slots)
  })

  return wrapper
}
