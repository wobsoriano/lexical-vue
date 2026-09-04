import type { Signal } from '@lexical/extension'
import type { EditorState } from 'lexical'
import type { ShallowRef } from 'vue'
import { EditorStateExtension, namedSignals, signal } from '@lexical/extension'
import { RichTextExtension } from '@lexical/rich-text'
import { flushPromises, mount } from '@vue/test-utils'
import { $createParagraphNode, $createTextNode, $getRoot, defineExtension } from 'lexical'
import { expect, test } from 'vite-plus/test'
import { defineComponent, h, nextTick } from 'vue'
import { useLexicalComposer } from '../src/LexicalComposer'
import { ContentEditable } from '../src/LexicalContentEditable'
import { LexicalExtensionComposer } from '../src/LexicalExtensionComposer'
import { useExtensionDependency } from '../src/useExtensionDependency'
import { useExtensionSignalValue, useSignalValue } from '../src/useExtensionSignalValue'

const EditorStateProbeExtension = defineExtension({
  dependencies: [RichTextExtension, EditorStateExtension],
  name: '[lexical-vue-tests]/EditorStateProbe',
})

const CounterExtension = defineExtension({
  build: () => namedSignals({ count: 0 }),
  dependencies: [RichTextExtension],
  name: '[lexical-vue-tests]/Counter',
})

type Exact<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false

function mountProbe() {
  let editor!: ReturnType<typeof useLexicalComposer>
  let editorState!: Readonly<ShallowRef<EditorState>>
  const Inner = defineComponent({
    setup() {
      editor = useLexicalComposer()
      editorState = useSignalValue(useExtensionDependency(EditorStateExtension).output)
      return () => h(ContentEditable)
    },
  })
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          LexicalExtensionComposer,
          { extension: EditorStateProbeExtension },
          { default: () => [h(Inner)] },
        ),
    }),
    { attachTo: document.body },
  )
  return { wrapper, editor, editorState }
}

test('an extension output signal is readable as a ref', () => {
  const { wrapper, editor, editorState } = mountProbe()
  expect(
    editorState.value,
    'the ref holds the EditorState the extension signal currently carries',
  ).toBe(editor.getEditorState())
  wrapper.unmount()
})

test('an editor update reaches the ref through the signal', async () => {
  const { wrapper, editor, editorState } = mountProbe()
  const before = editorState.value
  editor.update(() => {
    $getRoot()
      .clear()
      .append($createParagraphNode().append($createTextNode('signal sync')))
  })
  await nextTick()
  await flushPromises()
  const after = editorState.value
  expect(after, 'the commit swapped a new EditorState into the ref').not.toBe(before)
  expect(
    after.read(() => $getRoot().getTextContent()),
    'the EditorState in the ref is the committed one',
  ).toBe('signal sync')
  wrapper.unmount()
})

test('the signal subscription is released with the effect scope', () => {
  const counter = signal(0)
  let count!: Readonly<ShallowRef<number>>
  const wrapper = mount(
    defineComponent({
      setup() {
        count = useSignalValue(counter)
        return () => h('div', count.value)
      },
    }),
  )
  expect(count.value, 'the ref is seeded from the signal').toBe(0)
  counter.value = 1
  expect(count.value, 'a signal write reaches the ref while mounted').toBe(1)
  wrapper.unmount()
  counter.value = 2
  expect(count.value, 'unmounting unsubscribes the ref from the signal').toBe(1)
})

test('an extension output signal under a named prop resolves through useExtensionSignalValue', () => {
  let count!: Readonly<ShallowRef<number>>
  let counter!: Signal<number>
  let valueIsNumberRef = false
  const Inner = defineComponent({
    setup() {
      const value = useExtensionSignalValue(CounterExtension, 'count')
      const isNumberRef: Exact<typeof value, Readonly<ShallowRef<number>>> = true
      valueIsNumberRef = isNumberRef
      count = value
      counter = useExtensionDependency(CounterExtension).output.count
      return () => h(ContentEditable)
    },
  })
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(LexicalExtensionComposer, { extension: CounterExtension }, { default: () => [h(Inner)] }),
    }),
    { attachTo: document.body },
  )
  expect(count.value, 'the ref is seeded from the extension output signal').toBe(0)
  counter.value = 7
  expect(count.value, 'writing the extension output signal updates the ref').toBe(7)
  expect(
    valueIsNumberRef,
    'the output signal generic resolves to Readonly<ShallowRef<number>>',
  ).toBe(true)
  wrapper.unmount()
})
