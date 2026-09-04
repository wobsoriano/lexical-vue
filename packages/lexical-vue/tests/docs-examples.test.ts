import type { EditorState } from 'lexical'
import type { ShallowRef } from 'vue'
import { EditorStateExtension, namedSignals } from '@lexical/extension'
import { HistoryExtension } from '@lexical/history'
import { ListExtension } from '@lexical/list'
import { RichTextExtension } from '@lexical/rich-text'
import { mount } from '@vue/test-utils'
import { configExtension, defineExtension } from 'lexical'
import { expect, test } from 'vite-plus/test'
import { defineComponent, h } from 'vue'
import { useLexicalComposer } from '../src/LexicalComposer'
import { ContentEditable } from '../src/LexicalContentEditable'
import { LexicalExtensionComposer } from '../src/LexicalExtensionComposer'
import { useExtensionDependency } from '../src/useExtensionDependency'
import { useExtensionSignalValue, useSignalValue } from '../src/useExtensionSignalValue'
import { VueExtension } from '../src/VueExtension'

test('extensions/usage.md: the editor example builds with namespace and theme', () => {
  const extension = defineExtension({
    name: 'MyEditor',
    namespace: 'MyEditor',
    dependencies: [RichTextExtension, HistoryExtension, ListExtension],
    theme: {},
  })
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(LexicalExtensionComposer, { extension }, { default: () => [h(ContentEditable)] }),
    }),
    { attachTo: document.body },
  )

  expect(
    wrapper.find('[contenteditable]').exists(),
    'the documented extension editor renders an editable region',
  ).toBe(true)
  wrapper.unmount()
})

test('extensions/vue-ui.md: a contributed decorator renders and reaches the editor', () => {
  const MentionsPanel = defineComponent({
    name: 'MentionsPanel',
    setup() {
      useLexicalComposer()
      return () => h('div', { 'data-mentions': '' })
    },
  })
  const MentionsExtension = defineExtension({
    name: '@app/Mentions',
    dependencies: [configExtension(VueExtension, { decorators: [MentionsPanel] })],
  })
  const extension = defineExtension({
    name: '@app/Editor',
    dependencies: [RichTextExtension, MentionsExtension],
  })
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(LexicalExtensionComposer, { extension }, { default: () => [h(ContentEditable)] }),
    }),
    { attachTo: document.body },
  )

  expect(
    wrapper.findAll('[data-mentions]').length,
    'the extension contributes UI without the app rendering it',
  ).toBe(1)
  wrapper.unmount()
})

test('extensions/vue-ui.md: an arrow decorator passing props renders', () => {
  const Toolbar = defineComponent({
    name: 'Toolbar',
    props: { compact: { type: Boolean, default: false } },
    setup: (props) => () => h('div', { 'data-compact': String(props.compact) }),
  })
  const extension = defineExtension({
    name: '@app/WithToolbar',
    dependencies: [
      RichTextExtension,
      configExtension(VueExtension, { decorators: [() => h(Toolbar, { compact: true })] }),
    ],
  })
  const wrapper = mount(
    defineComponent({ setup: () => () => h(LexicalExtensionComposer, { extension }) }),
    { attachTo: document.body },
  )

  expect(
    wrapper.find('[data-compact]').attributes('data-compact'),
    'the arrow form passes props to the contributed component',
  ).toBe('true')
  wrapper.unmount()
})

test('extensions/signals.md: both documented signal reads work', () => {
  const WordCountExtension = defineExtension({
    name: '@app/WordCount',
    dependencies: [RichTextExtension],
    build: () => namedSignals({ count: 0 }),
  })
  const extension = defineExtension({
    name: '@app/SignalsDoc',
    dependencies: [WordCountExtension, EditorStateExtension],
  })

  let count!: Readonly<ShallowRef<number>>
  let editorState!: Readonly<ShallowRef<EditorState>>
  let editor!: ReturnType<typeof useLexicalComposer>
  const Inner = defineComponent({
    setup() {
      editor = useLexicalComposer()
      count = useExtensionSignalValue(WordCountExtension, 'count')
      editorState = useSignalValue(useExtensionDependency(EditorStateExtension).output)
      return () => h(ContentEditable)
    },
  })
  const wrapper = mount(
    defineComponent({
      setup: () => () => h(LexicalExtensionComposer, { extension }, { default: () => [h(Inner)] }),
    }),
    { attachTo: document.body },
  )

  expect(count.value, 'useExtensionSignalValue reads a named signal').toBe(0)
  expect(
    editorState.value,
    'the documented identity comparison holds, so the ref is not a reactive proxy',
  ).toBe(editor.getEditorState())
  wrapper.unmount()
})
