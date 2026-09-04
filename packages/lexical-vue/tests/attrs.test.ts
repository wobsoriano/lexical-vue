import type { Component } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vite-plus/test'
import { defineComponent, h } from 'vue'
import { LexicalComposer } from '../src/LexicalComposer'
import { ContentEditable } from '../src/LexicalContentEditable'
import { RichTextPlugin } from '../src/LexicalRichTextPlugin'

test('ContentEditable renders a stable attribute set', () => {
  const props = {
    ariaLabel: 'Editor input',
    ariaDescribedBy: 'desc',
    autocapitalize: 'none',
    tabindex: 3,
    id: 'my-editor',
    'data-testid': 'ce',
    class: 'editor-class',
  }
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          LexicalComposer as unknown as Component,
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
              h(RichTextPlugin as unknown as Component, null, {
                contentEditable: () => h(ContentEditable as unknown as Component, props),
              }),
            ],
          },
        ),
    }),
    { attachTo: document.body },
  )
  const el = wrapper.find('[contenteditable]').element
  const attrs = Object.fromEntries(
    [...el.attributes].map((a) => [a.name, a.value]).sort(([a], [b]) => a.localeCompare(b)),
  )
  expect(attrs).toMatchSnapshot()
  wrapper.unmount()
})
