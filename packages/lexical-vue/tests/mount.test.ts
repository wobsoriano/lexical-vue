import type { Component } from 'vue'
import { HashtagNode } from '@lexical/hashtag'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { MarkNode } from '@lexical/mark'
import { OverflowNode } from '@lexical/overflow'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vite-plus/test'
import { defineComponent, h } from 'vue'
import { HorizontalRuleNode } from '../src/LexicalHorizontalRuleNode'
import { LexicalComposer, useLexicalComposer } from '../src/LexicalComposer'

const NODES = [
  AutoLinkNode,
  HashtagNode,
  HeadingNode,
  HorizontalRuleNode,
  LinkNode,
  ListItemNode,
  ListNode,
  MarkNode,
  OverflowNode,
  QuoteNode,
  TableCellNode,
  TableNode,
  TableRowNode,
]

interface Case {
  name: string
  load: () => Promise<Record<string, unknown>>
  props?: Record<string, unknown>
  slots?: Record<string, () => unknown>
  needsEditor?: boolean
}

const CASES: Case[] = [
  { name: 'AutoFocusPlugin', load: () => import('../src/LexicalAutoFocusPlugin') },
  {
    name: 'AutoLinkPlugin',
    load: () => import('../src/LexicalAutoLinkPlugin'),
    props: { matchers: [] },
  },
  {
    name: 'LexicalAutoScrollPlugin',
    load: () => import('../src/LexicalAutoScrollPlugin'),
    props: { scrollRef: null },
  },
  { name: 'CharacterLimitPlugin', load: () => import('../src/LexicalCharacterLimitPlugin.vine') },
  { name: 'CheckListPlugin', load: () => import('../src/LexicalCheckListPlugin') },
  { name: 'ClearEditorPlugin', load: () => import('../src/LexicalClearEditorPlugin') },
  { name: 'ClickableLinkPlugin', load: () => import('../src/LexicalClickableLinkPlugin') },
  { name: 'ContentEditable', load: () => import('../src/LexicalContentEditable.vine') },
  { name: 'HashtagPlugin', load: () => import('../src/LexicalHashtagPlugin') },
  { name: 'HistoryPlugin', load: () => import('../src/LexicalHistoryPlugin') },
  { name: 'HorizontalRulePlugin', load: () => import('../src/LexicalHorizontalRulePlugin') },
  { name: 'LinkPlugin', load: () => import('../src/LexicalLinkPlugin') },
  { name: 'ListPlugin', load: () => import('../src/LexicalListPlugin') },
  {
    name: 'MarkdownShortcutPlugin',
    load: () => import('../src/LexicalMarkdownShortcutPlugin'),
    props: { transformers: [] },
  },
  {
    name: 'OnChangePlugin',
    load: () => import('../src/LexicalOnChangePlugin'),
    props: { onChange: () => {} },
  },
  { name: 'PlainTextPlugin', load: () => import('../src/LexicalPlainTextPlugin') },
  { name: 'RichTextPlugin', load: () => import('../src/LexicalRichTextPlugin') },
  {
    name: 'SelectionAlwaysOnDisplay',
    load: () => import('../src/LexicalSelectionAlwaysOnDisplay'),
  },
  { name: 'TabIndentationPlugin', load: () => import('../src/LexicalTabIndentationPlugin') },
  {
    name: 'TableOfContentsPlugin',
    load: () => import('../src/LexicalTableOfContentsPlugin'),
    slots: { default: () => h('div') },
  },
  { name: 'TablePlugin', load: () => import('../src/LexicalTablePlugin') },
  { name: 'TreeView', load: () => import('../src/LexicalTreeView.vine'), needsEditor: true },
  {
    name: 'NodeMenuPlugin',
    load: () => import('../src/LexicalNodeMenuPlugin.vine'),
    props: { options: [], nodeKey: null },
    slots: { default: () => h('div') },
  },
  {
    name: 'TypeaheadMenuPlugin',
    load: () => import('../src/LexicalTypeaheadMenuPlugin.vine'),
    props: { options: [], triggerFn: () => null, onQueryChange: () => {} },
    slots: { default: () => h('div') },
  },
  {
    name: 'LexicalAutoEmbedPlugin',
    load: () => import('../src/LexicalAutoEmbedPlugin.vine'),
    props: { embedConfigs: [], getMenuOptions: () => [] },
    slots: { default: () => h('div') },
  },
]

function mountInComposer(component: Component, c: Case) {
  const Host = defineComponent({
    setup: () => () =>
      h(
        LexicalComposer as unknown as Component,
        {
          initialConfig: {
            namespace: 'test',
            nodes: NODES,
            onError: (e: Error) => {
              throw e
            },
          },
        },
        {
          default: () => [
            h(
              defineComponent({
                setup: () => () =>
                  h(
                    component,
                    {
                      ...(c.needsEditor ? { editor: useLexicalComposer() } : {}),
                      ...c.props,
                    },
                    c.slots ?? {},
                  ),
              }),
            ),
          ],
        },
      ),
  })
  return mount(Host, { attachTo: document.body })
}

test('the registry covers every component the package exports', async () => {
  for (const c of CASES) {
    const mod = await c.load()
    const exported = mod[c.name]
    expect(
      typeof exported === 'function' || (typeof exported === 'object' && exported !== null),
      `${c.name} is exported as a Vue component`,
    ).toBe(true)
  }
})

test.each(CASES.map((c) => [c.name, c] as const))(
  '%s mounts inside a composer',
  async (_name, c) => {
    const mod = await c.load()
    const wrapper = mountInComposer(mod[c.name] as Component, c)
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  },
)
