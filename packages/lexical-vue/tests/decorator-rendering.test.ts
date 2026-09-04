import type { SerializedLexicalNode } from 'lexical'
import type { VNode } from 'vue'
import { RichTextExtension } from '@lexical/rich-text'
import { flushPromises, mount } from '@vue/test-utils'
import { $createParagraphNode, $getRoot, DecoratorNode, defineExtension } from 'lexical'
import { expect, test } from 'vite-plus/test'
import { defineComponent, h, nextTick } from 'vue'
import { useLexicalComposer } from '../src/LexicalComposer'
import { ContentEditable } from '../src/LexicalContentEditable'
import { LexicalExtensionComposer } from '../src/LexicalExtensionComposer'
import { RichTextPlugin } from '../src/LexicalRichTextPlugin'

const Badge = defineComponent({
  name: 'Badge',
  setup: () => () => h('span', { 'data-badge': '' }, 'decorated'),
})

class BadgeNode extends DecoratorNode<VNode> {
  static getType() {
    return 'test-badge'
  }

  static clone(node: BadgeNode) {
    return new BadgeNode(node.__key)
  }

  static importJSON(): BadgeNode {
    return new BadgeNode()
  }

  exportJSON(): SerializedLexicalNode {
    return { type: 'test-badge', version: 1 }
  }

  createDOM(): HTMLElement {
    return document.createElement('span')
  }

  updateDOM(): false {
    return false
  }

  decorate(): VNode {
    return h(Badge)
  }
}

const BadgeExtension = defineExtension({
  name: 'test-badge',
  dependencies: [RichTextExtension],
  nodes: [BadgeNode],
})

async function mountAndInsertBadge(renderInner: () => unknown) {
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
        h(LexicalExtensionComposer, { extension: BadgeExtension }, { default: () => [h(Inner)] }),
    }),
    { attachTo: document.body },
  )

  editor.update(() => {
    $getRoot().clear().append($createParagraphNode().append(new BadgeNode()))
  })
  await nextTick()
  await flushPromises()
  await nextTick()

  return { editor, wrapper }
}

test('a decorator node renders under the extension composer', async () => {
  const { editor, wrapper } = await mountAndInsertBadge(() => h(ContentEditable))

  expect(
    Object.keys(editor.getDecorators()).length,
    'the editor produced a decorator, so any miss is on the Vue side',
  ).toBe(1)
  expect(
    document.querySelectorAll('[data-badge]').length,
    'the decorator node renders exactly once',
  ).toBe(1)
  wrapper.unmount()
})

test('a decorator node renders once when RichTextPlugin is also nested inside', async () => {
  const { wrapper } = await mountAndInsertBadge(() =>
    h(RichTextPlugin, null, { contentEditable: () => h(ContentEditable) }),
  )

  expect(
    document.querySelectorAll('[data-badge]').length,
    'the hybrid composer plus RichTextPlugin case renders one decorator, not two',
  ).toBe(1)
  wrapper.unmount()
})

test('a nested composer renders a decorator for each editor', async () => {
  const editors: ReturnType<typeof useLexicalComposer>[] = []
  const Capture = defineComponent({
    props: { renderInner: { type: Function, required: true } },
    setup(props) {
      editors.push(useLexicalComposer())
      return () => props.renderInner()
    },
  })
  const Nested = defineComponent({
    setup: () => () =>
      h(
        LexicalExtensionComposer,
        { extension: BadgeExtension },
        { default: () => [h(Capture, { renderInner: () => h(ContentEditable) })] },
      ),
  })
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          LexicalExtensionComposer,
          { extension: BadgeExtension },
          { default: () => [h(Capture, { renderInner: () => [h(ContentEditable), h(Nested)] })] },
        ),
    }),
    { attachTo: document.body },
  )

  expect(editors.length, 'the inner composer built a second editor').toBe(2)
  expect(editors[0], 'the two composers own distinct editors').not.toBe(editors[1])

  for (const editor of editors) {
    editor.update(() => {
      $getRoot().clear().append($createParagraphNode().append(new BadgeNode()))
    })
  }
  await nextTick()
  await flushPromises()
  await nextTick()

  expect(
    document.querySelectorAll('[data-badge]').length,
    'each editor renders its own decorator, so the host claim is keyed by editor and not by a flag',
  ).toBe(2)
  wrapper.unmount()
})
