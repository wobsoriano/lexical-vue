import type { LexicalEditorWithDispose } from 'lexical'
import { RichTextExtension } from '@lexical/rich-text'
import { flushPromises, mount } from '@vue/test-utils'
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical'
import { expect, test, vi } from 'vite-plus/test'
import { defineComponent, h, nextTick } from 'vue'
import { useLexicalComposer } from '../src/LexicalComposer'
import { ContentEditable } from '../src/LexicalContentEditable'
import { LexicalExtensionComposer } from '../src/LexicalExtensionComposer'

function mountComposer(renderInner: () => unknown = () => null) {
  let editor!: ReturnType<typeof useLexicalComposer>
  const Inner = defineComponent({
    setup() {
      editor = useLexicalComposer()
      return () => renderInner()
    },
  })
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          LexicalExtensionComposer,
          { extension: RichTextExtension },
          { default: () => [h(Inner)] },
        ),
    }),
    { attachTo: document.body },
  )
  return { wrapper, editor }
}

test('an extension builds an editor the default slot can inject', () => {
  const { wrapper, editor } = mountComposer()
  expect(editor, 'useLexicalComposer resolves the extension-built editor').toBeTruthy()
  expect(typeof editor.getEditorState, 'the injected value is a LexicalEditor').toBe('function')
  wrapper.unmount()
})

test('an existing lexical-vue component works unchanged inside it', () => {
  const { wrapper, editor } = mountComposer(() => h(ContentEditable))
  expect(
    wrapper.find('[contenteditable]').exists(),
    'ContentEditable renders without a LexicalComposer ancestor',
  ).toBe(true)
  expect(
    editor.getRootElement(),
    'the provided editor owns the rendered root element',
  ).not.toBeNull()
  wrapper.unmount()
})

test('editor state changes reach the DOM', async () => {
  const { wrapper, editor } = mountComposer(() => h(ContentEditable))
  editor.update(() => {
    $getRoot()
      .clear()
      .append($createParagraphNode().append($createTextNode('hello extensions')))
  })
  await nextTick()
  await flushPromises()
  expect(
    wrapper.find('[contenteditable]').text(),
    'text committed through the extension-built editor renders',
  ).toContain('hello extensions')
  wrapper.unmount()
})

test('the editor is disposed on unmount', () => {
  const { wrapper, editor } = mountComposer()
  const dispose = vi.spyOn(editor as LexicalEditorWithDispose, 'dispose')
  expect(dispose, 'dispose is untouched while mounted').not.toHaveBeenCalled()
  wrapper.unmount()
  expect(dispose, 'unmounting releases the editor the composer built').toHaveBeenCalledTimes(1)
})
