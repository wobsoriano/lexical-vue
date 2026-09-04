import { AutoLinkNode, LinkNode } from '@lexical/link'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vite-plus/test'
import { defineComponent, h, nextTick } from 'vue'
import { LexicalComposer, useLexicalComposer } from '../src/LexicalComposer'
import { ContentEditable } from '../src/LexicalContentEditable'
import { RichTextPlugin } from '../src/LexicalRichTextPlugin'
import { INSERT_EMBED_COMMAND, LexicalAutoEmbedPlugin } from '../src/LexicalAutoEmbedPlugin'
import { LexicalMenu, MenuOption } from '../src/shared/LexicalMenu'

function inComposer(inner: () => unknown, nodes: unknown[] = []) {
  return mount(
    defineComponent({
      setup: () => () =>
        h(
          LexicalComposer,
          {
            initialConfig: {
              namespace: 't',
              nodes: nodes as never,
              onError: (e: Error) => {
                throw e
              },
            },
          },
          { default: () => [h(defineComponent({ setup: () => () => inner() }))] },
        ),
    }),
    { attachTo: document.body },
  )
}

function mountMenu(extra: Record<string, unknown>) {
  let seen: number | null | undefined
  const wrapper = inComposer(() =>
    h(
      LexicalMenu as any,
      {
        close: () => {},
        editor: useLexicalComposer(),
        anchorElementRef: document.createElement('div'),
        resolution: { getRect: () => document.createElement('div').getBoundingClientRect() },
        options: [new MenuOption('a'), new MenuOption('b')],
        ...extra,
      },
      {
        default: (p: any) => {
          seen = p.itemProps.selectedIndex
          return h('div')
        },
      },
    ),
  )
  return { wrapper, selectedIndex: () => seen }
}

test('preselectFirstItem absent highlights the first option', async () => {
  const { wrapper, selectedIndex } = mountMenu({})
  await nextTick()
  expect(selectedIndex()).toBe(0)
  wrapper.unmount()
})

test('preselectFirstItem false leaves nothing highlighted', async () => {
  const { wrapper, selectedIndex } = mountMenu({ preselectFirstItem: false })
  await nextTick()
  expect(selectedIndex()).toBeNull()
  wrapper.unmount()
})

test('preselectFirstItem true highlights the first option', async () => {
  const { wrapper, selectedIndex } = mountMenu({ preselectFirstItem: true })
  await nextTick()
  expect(selectedIndex()).toBe(0)
  wrapper.unmount()
})

function mountEditable(props: Record<string, unknown>) {
  const wrapper = inComposer(() =>
    h(RichTextPlugin, null, { contentEditable: () => h(ContentEditable, props) }),
  )
  return { wrapper, spellcheck: () => wrapper.find('[contenteditable]').attributes('spellcheck') }
}

test('spellcheck absent renders spellcheck="true"', () => {
  const { wrapper, spellcheck } = mountEditable({})
  expect(spellcheck()).toBe('true')
  wrapper.unmount()
})

test('spellcheck false renders spellcheck="false"', () => {
  const { wrapper, spellcheck } = mountEditable({ spellcheck: false })
  expect(spellcheck()).toBe('false')
  wrapper.unmount()
})

test('spellcheck true renders spellcheck="true"', () => {
  const { wrapper, spellcheck } = mountEditable({ spellcheck: true })
  expect(spellcheck()).toBe('true')
  wrapper.unmount()
})

test('spellCheck in camelCase behaves the same as absent', () => {
  const { wrapper, spellcheck } = mountEditable({ spellCheck: false })
  expect(spellcheck()).toBe('true')
  wrapper.unmount()
})

function mountAutoEmbed(listener?: (config: unknown) => void) {
  let editor: ReturnType<typeof useLexicalComposer>
  const wrapper = inComposer(() => {
    editor = useLexicalComposer()
    return h(
      LexicalAutoEmbedPlugin as any,
      {
        embedConfigs: [{ type: 'yt', parseUrl: () => null, insertNode: () => {} }],
        getMenuOptions: () => [],
        ...(listener ? { onOpenEmbedModalForConfig: listener } : {}),
      },
      { default: () => h('div') },
    )
  }, [LinkNode, AutoLinkNode])
  return { wrapper, editor: editor! }
}

test('the embed command is only handled when a listener is passed', () => {
  const seen: unknown[] = []
  const withListener = mountAutoEmbed((c) => seen.push(c))
  expect(withListener.editor.dispatchCommand(INSERT_EMBED_COMMAND, 'yt')).toBe(true)
  expect(seen).toHaveLength(1)
  withListener.wrapper.unmount()

  const without = mountAutoEmbed()
  expect(without.editor.dispatchCommand(INSERT_EMBED_COMMAND, 'yt')).toBe(false)
  without.wrapper.unmount()
})
