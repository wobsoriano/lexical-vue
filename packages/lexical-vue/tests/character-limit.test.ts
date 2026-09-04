import { OverflowNode } from '@lexical/overflow'
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vite-plus/test'
import { defineComponent, h, nextTick, ref } from 'vue'
import { CharacterLimitPlugin } from '../src/LexicalCharacterLimitPlugin'
import { LexicalComposer } from '../src/LexicalComposer'

function mountWithContent(text: string, maxLength: number) {
  let seen: number | undefined
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          LexicalComposer,
          {
            initialConfig: {
              namespace: 't',
              nodes: [OverflowNode],
              onError: (e: Error) => {
                throw e
              },
              editorState: () => {
                $getRoot()
                  .clear()
                  .append($createParagraphNode().append($createTextNode(text)))
              },
            },
          },
          {
            default: () => [
              h(
                CharacterLimitPlugin as never,
                { maxLength, charset: 'UTF-16' },
                {
                  default: (p: { remainingCharacters: number }) => {
                    seen = p.remainingCharacters
                    return h('div')
                  },
                },
              ),
            ],
          },
        ),
    }),
    { attachTo: document.body },
  )
  return { wrapper, remaining: () => seen }
}

test('the remaining count reflects content already in the editor', async () => {
  const { wrapper, remaining } = mountWithContent('abcdefghij', 5)
  await nextTick()
  expect(remaining(), 'ten characters against a limit of five leaves -5').toBe(-5)
  wrapper.unmount()
})

test('the remaining count is correct when the plugin mounts into settled content', async () => {
  const show = ref(false)
  let seen: number | undefined
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          LexicalComposer,
          {
            initialConfig: {
              namespace: 't',
              nodes: [OverflowNode],
              onError: (e: Error) => {
                throw e
              },
              editorState: () => {
                $getRoot()
                  .clear()
                  .append($createParagraphNode().append($createTextNode('abcdefghij')))
              },
            },
          },
          {
            default: () =>
              show.value
                ? [
                    h(
                      CharacterLimitPlugin as never,
                      { maxLength: 5, charset: 'UTF-16' },
                      {
                        default: (p: { remainingCharacters: number }) => {
                          seen = p.remainingCharacters
                          return h('div')
                        },
                      },
                    ),
                  ]
                : [],
          },
        ),
    }),
    { attachTo: document.body },
  )
  await nextTick()
  show.value = true
  await nextTick()
  await nextTick()
  expect(seen, 'the count must reflect content that was already there').toBe(-5)
  wrapper.unmount()
})
