import type { Component } from 'vue'
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical'
import { flushPromises, mount } from '@vue/test-utils'
import { expect, test } from 'vite-plus/test'
import { defineComponent, h, nextTick } from 'vue'
import { LexicalComposer, useLexicalComposer } from '../src/LexicalComposer'
import { ContentEditable } from '../src/LexicalContentEditable.vine'
import { RichTextPlugin } from '../src/LexicalRichTextPlugin'

function mountEditor(contentEditableProps: Record<string, unknown> = {}) {
  let editor: ReturnType<typeof useLexicalComposer>
  const Inner = defineComponent({
    setup() {
      editor = useLexicalComposer()
      return () =>
        h(RichTextPlugin as unknown as Component, null, {
          placeholder: () => h('span', { class: 'ph' }, 'Type here'),
          contentEditable: () => h(ContentEditable as unknown as Component, contentEditableProps),
        })
    },
  })
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          LexicalComposer as unknown as Component,
          {
            initialConfig: {
              namespace: 'test',
              onError: (e: Error) => {
                throw e
              },
            },
          },
          { default: () => [h(Inner)] },
        ),
    }),
    { attachTo: document.body },
  )
  return { wrapper, editor: editor! }
}

test('renders a contenteditable element bound to the editor', () => {
  const { wrapper, editor } = mountEditor()
  const el = wrapper.find('[contenteditable]')
  expect(el.exists()).toBe(true)
  expect(editor.getRootElement()).not.toBeNull()
  wrapper.unmount()
})

test('a declared prop reaches the rendered element', () => {
  const { wrapper } = mountEditor({ ariaLabel: 'Editor input' })
  expect(wrapper.find('[contenteditable]').attributes('aria-label')).toBe('Editor input')
  wrapper.unmount()
})

test('an HTML attribute prop passes through the $props spread', () => {
  const { wrapper } = mountEditor({ autocapitalize: 'none', tabindex: 3 })
  const el = wrapper.find('[contenteditable]')
  expect(el.attributes('autocapitalize')).toBe('none')
  expect(el.attributes('tabindex')).toBe('3')
  wrapper.unmount()
})

test('the placeholder slot renders', () => {
  const { wrapper } = mountEditor()
  expect(wrapper.find('.ph').text()).toBe('Type here')
  wrapper.unmount()
})

test('editor state changes reach the DOM', async () => {
  const { wrapper, editor } = mountEditor()
  editor.update(() => {
    $getRoot()
      .clear()
      .append($createParagraphNode().append($createTextNode('hello world')))
  })
  await nextTick()
  await flushPromises()
  expect(wrapper.find('[contenteditable]').text()).toContain('hello world')
  wrapper.unmount()
})
