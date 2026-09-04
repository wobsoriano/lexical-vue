import type { LexicalEditor } from 'lexical'
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
} from 'lexical'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vite-plus/test'
import { defineComponent, h, ref } from 'vue'
import { LexicalComposer, useLexicalComposer } from '../src/LexicalComposer'
import { useLexicalNodeSelection } from '../src/useLexicalNodeSelection'

function setup() {
  const key = ref('pending')
  let editor!: LexicalEditor
  let api!: ReturnType<typeof useLexicalNodeSelection>
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          LexicalComposer,
          {
            initialConfig: {
              namespace: 't',
              onError: (e: Error) => {
                throw e
              },
            },
          },
          {
            default: () => [
              h(
                defineComponent({
                  setup() {
                    editor = useLexicalComposer()
                    api = useLexicalNodeSelection(key)
                    return () => h('div')
                  },
                }),
              ),
            ],
          },
        ),
    }),
    { attachTo: document.body },
  )

  let otherKey = ''
  editor.update(() => {
    const a = $createParagraphNode().append($createTextNode('first'))
    const b = $createParagraphNode().append($createTextNode('second'))
    $getRoot().clear().append(a).append(b)
    otherKey = b.getKey()
    a.selectEnd()
  })
  key.value = otherKey
  return { wrapper, editor, api }
}

test('setSelected(false) on a node outside the selection keeps the caret', () => {
  const { wrapper, editor, api } = setup()
  const [, setSelected] = api

  expect(
    editor.read(() => $isRangeSelection($getSelection())),
    'range selection before',
  ).toBe(true)

  setSelected(false)

  expect(
    editor.read(() => $isRangeSelection($getSelection())),
    'deselecting a node the selection does not cover must not discard the caret',
  ).toBe(true)
  wrapper.unmount()
})

test('setSelected(true) still creates a node selection', () => {
  const { wrapper, editor, api } = setup()
  const [, setSelected] = api

  setSelected(true)

  expect(
    editor.read(() => $isNodeSelection($getSelection())),
    'selecting still works',
  ).toBe(true)
  wrapper.unmount()
})
