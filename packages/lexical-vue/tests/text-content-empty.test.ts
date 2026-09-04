import type { LexicalEditor } from 'lexical'
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vite-plus/test'
import { defineComponent, h, nextTick, ref } from 'vue'
import { LexicalComposer, useLexicalComposer } from '../src/LexicalComposer'
import { useLexicalIsTextContentEmpty } from '../src/useLexicalIsTextContentEmpty'

test('a change to trim re-derives without waiting for the next edit', async () => {
  const trim = ref(false)
  let editor!: LexicalEditor
  let isEmpty!: { value: boolean }

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
              editorState: () => {
                $getRoot()
                  .clear()
                  .append($createParagraphNode().append($createTextNode('   ')))
              },
            },
          },
          {
            default: () => [
              h(
                defineComponent({
                  setup() {
                    editor = useLexicalComposer()
                    isEmpty = useLexicalIsTextContentEmpty(editor, trim) as never
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

  await nextTick()
  expect(isEmpty.value, 'whitespace is not empty when trim is off').toBe(false)

  trim.value = true
  await nextTick()

  expect(isEmpty.value, 'turning trim on must re-derive, not wait for the next editor update').toBe(
    true,
  )
  wrapper.unmount()
})
