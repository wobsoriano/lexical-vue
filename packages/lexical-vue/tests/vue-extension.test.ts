import type { LexicalEditor } from 'lexical'
import { buildEditorFromExtensions } from '@lexical/extension'
import { RichTextExtension } from '@lexical/rich-text'
import { mount } from '@vue/test-utils'
import { configExtension, defineExtension } from 'lexical'
import { expect, test } from 'vite-plus/test'
import { defineComponent, h } from 'vue'
import { useLexicalComposer } from '../src/LexicalComposer'
import { ContentEditable } from '../src/LexicalContentEditable'
import { LexicalExtensionComposer } from '../src/LexicalExtensionComposer'
import { VueExtension } from '../src/VueExtension'

const AppMarker = defineComponent({
  name: 'AppMarker',
  setup: () => () => h('span', { 'data-app': '' }),
})

const PanelOne = defineComponent({
  name: 'PanelOne',
  setup: () => () => h('span', { 'data-panel-one': '' }),
})

const PanelTwo = defineComponent({
  name: 'PanelTwo',
  setup: () => () => h('span', { 'data-panel-two': '' }),
})

test('the default config renders nothing beyond the default slot', () => {
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          LexicalExtensionComposer,
          { extension: RichTextExtension },
          { default: () => [h(AppMarker)] },
        ),
    }),
    { attachTo: document.body },
  )

  expect(wrapper.findAll('[data-app]').length, 'the default slot renders').toBe(1)
  expect(
    wrapper.findAll('[contenteditable]').length,
    'a null contentEditable default installs no editable of its own',
  ).toBe(0)
  wrapper.unmount()
})

test('a config contentEditable renders when no slot is given', () => {
  const extension = defineExtension({
    name: 'test/config-editable',
    dependencies: [
      RichTextExtension,
      configExtension(VueExtension, {
        contentEditable: h('div', { 'data-source': 'config' }, [h(ContentEditable)]),
      }),
    ],
  })
  const wrapper = mount(
    defineComponent({
      setup: () => () => h(LexicalExtensionComposer, { extension }),
    }),
    { attachTo: document.body },
  )

  expect(
    wrapper.find('[data-source]').attributes('data-source'),
    'the extension supplies the editable region with no app-side markup',
  ).toBe('config')
  expect(
    wrapper.findAll('[contenteditable]').length,
    'exactly one editable region is installed',
  ).toBe(1)
  wrapper.unmount()
})

test('the contentEditable slot overrides the config contentEditable', () => {
  const extension = defineExtension({
    name: 'test/slot-override',
    dependencies: [
      RichTextExtension,
      configExtension(VueExtension, {
        contentEditable: h('div', { 'data-source': 'config' }, [h(ContentEditable)]),
      }),
    ],
  })
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          LexicalExtensionComposer,
          { extension },
          { contentEditable: () => h('div', { 'data-source': 'slot' }, [h(ContentEditable)]) },
        ),
    }),
    { attachTo: document.body },
  )

  expect(
    wrapper.find('[data-source]').attributes('data-source'),
    'the slot wins over the config value',
  ).toBe('slot')
  expect(
    wrapper.findAll('[data-source]').length,
    'the config editable is not rendered alongside the slot',
  ).toBe(1)
  expect(
    wrapper.findAll('[contenteditable]').length,
    'only one editable region claims the editor root',
  ).toBe(1)
  wrapper.unmount()
})

test('an extension contributed decorator renders inside the editor context', () => {
  let panelEditor!: LexicalEditor
  const Panel = defineComponent({
    name: 'Panel',
    setup() {
      panelEditor = useLexicalComposer()
      return () => h('span', { 'data-panel': '' })
    },
  })
  const extension = defineExtension({
    name: 'test/panel',
    dependencies: [RichTextExtension, configExtension(VueExtension, { decorators: [Panel] })],
  })
  let hostedEditor!: LexicalEditor
  const Capture = defineComponent({
    setup() {
      hostedEditor = useLexicalComposer()
      return () => h(ContentEditable)
    },
  })
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(LexicalExtensionComposer, { extension }, { default: () => [h(Capture)] }),
    }),
    { attachTo: document.body },
  )

  expect(wrapper.findAll('[data-panel]').length, 'the contributed decorator renders once').toBe(1)
  expect(panelEditor, 'the contributed decorator reaches the editor with useLexicalComposer').toBe(
    hostedEditor,
  )
  wrapper.unmount()
})

test('config decorators from two different extensions both render', () => {
  const ExtensionOne = defineExtension({
    name: 'test/one',
    dependencies: [configExtension(VueExtension, { decorators: [PanelOne] })],
  })
  const ExtensionTwo = defineExtension({
    name: 'test/two',
    dependencies: [configExtension(VueExtension, { decorators: [PanelTwo] })],
  })
  const extension = defineExtension({
    name: 'test/both',
    dependencies: [RichTextExtension, ExtensionOne, ExtensionTwo],
  })
  const wrapper = mount(
    defineComponent({
      setup: () => () => h(LexicalExtensionComposer, { extension }),
    }),
    { attachTo: document.body },
  )

  expect(wrapper.findAll('[data-panel-one]').length, 'the first extension decorator renders').toBe(
    1,
  )
  expect(
    wrapper.findAll('[data-panel-two]').length,
    'the second extension decorator renders, so the configs concatenate',
  ).toBe(1)
  wrapper.unmount()
})

test('building without a Vue host fails with a message naming the dependent', () => {
  const MentionsExtension = defineExtension({
    name: 'test/mentions',
    dependencies: [configExtension(VueExtension, { decorators: [PanelOne] })],
  })

  expect(
    () => buildEditorFromExtensions(MentionsExtension),
    'a headless build of an extension that wants Vue UI fails loudly',
  ).toThrow(
    'VueExtension: no VueProviderExtension in this editor. Host it with LexicalExtensionComposer. Extensions that depend on VueExtension: test/mentions',
  )
})
