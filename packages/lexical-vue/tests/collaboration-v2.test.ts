import type { Provider } from '@lexical/yjs'
import type { LexicalEditor } from 'lexical'
import { DIFF_VERSIONS_COMMAND__EXPERIMENTAL } from '@lexical/yjs'
import { mount } from '@vue/test-utils'
import { $getRoot } from 'lexical'
import { expect, test } from 'vite-plus/test'
import { defineComponent, h, nextTick, ref, toRaw } from 'vue'
import { Doc, snapshot, XmlElement, XmlText } from 'yjs'
import { CollaborationPluginV2__EXPERIMENTAL } from '../src/LexicalCollaborationPlugin'
import { LexicalComposer, useLexicalComposer } from '../src/LexicalComposer'
import { ContentEditable } from '../src/LexicalContentEditable'
import { RichTextPlugin } from '../src/LexicalRichTextPlugin'
import { collaborationContext } from '../src/shared/useCollaborationContext'

type Listener = (arg: never) => void

function createProvider(doc: Doc) {
  const listeners = new Map<string, Set<Listener>>()
  const states = new Map<number, Record<string, unknown>>()
  const provider = {
    awareness: {
      getLocalState: () => states.get(doc.clientID) ?? null,
      getStates: () => states,
      off: () => {},
      on: () => {},
      setLocalState: (state: Record<string, unknown> | null) => {
        if (state === null) states.delete(doc.clientID)
        else states.set(doc.clientID, state)
      },
      setLocalStateField: (field: string, value: unknown) => {
        states.set(doc.clientID, { ...states.get(doc.clientID), [field]: value })
      },
    },
    connect: () => {},
    disconnect: () => {},
    off: (type: string, cb: Listener) => listeners.get(type)?.delete(cb),
    on: (type: string, cb: Listener) => {
      if (!listeners.has(type)) listeners.set(type, new Set())
      listeners.get(type)!.add(cb)
    },
  }
  const emit = (type: string, arg: unknown) => {
    for (const cb of listeners.get(type) ?? []) cb(arg as never)
  }
  return { provider: provider as unknown as Provider, emit }
}

const registeredDoc = (id: string) => toRaw(collaborationContext.value.yjsDocMap).get(id)

function appendParagraph(doc: Doc, text: string) {
  const paragraph = new XmlElement('paragraph')
  paragraph.insert(0, [new XmlText(text)])
  doc.get('root-v2', XmlElement).push([paragraph])
}

function mountCollab(pluginProps: () => Record<string, unknown>, key = ref(0)) {
  let editor: LexicalEditor
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          LexicalComposer,
          {
            key: key.value,
            initialConfig: {
              namespace: 't',
              editorState: null,
              nodes: [],
              onError: (e: Error) => {
                throw e
              },
            },
          },
          {
            default: () => [
              h(
                defineComponent({
                  setup: () => {
                    editor = useLexicalComposer()
                    return () => [
                      h(RichTextPlugin, null, { contentEditable: () => h(ContentEditable) }),
                      h(CollaborationPluginV2__EXPERIMENTAL as any, pluginProps()),
                    ]
                  },
                }),
              ),
            ],
          },
        ),
    }),
    { attachTo: document.body },
  )
  return { wrapper, editor: () => editor }
}

function textContent(editor: LexicalEditor) {
  return editor.getEditorState().read(() => $getRoot().getTextContent())
}

test('a keyed remount with the same id keeps the new doc registered', async () => {
  const docs = [new Doc(), new Doc()]
  const key = ref(0)
  const { wrapper } = mountCollab(() => {
    const doc = docs[key.value]
    return { id: 'main', doc, provider: createProvider(doc).provider }
  }, key)
  expect(registeredDoc('main')).toBe(docs[0])

  key.value = 1
  await nextTick()
  expect(registeredDoc('main')).toBe(docs[1])

  wrapper.unmount()
  expect(registeredDoc('main')).toBeUndefined()
})

test('a bare __should-bootstrap-unsafe attribute seeds the empty root on sync', async () => {
  const doc = new Doc()
  const { provider, emit } = createProvider(doc)
  // A bare template attribute reaches the component as an empty string.
  const { wrapper } = mountCollab(() => ({
    id: 'main',
    doc,
    provider,
    __shouldBootstrapUnsafe: '',
  }))

  emit('sync', true)
  await Promise.resolve()
  expect(doc.get('root-v2', XmlElement).length).toBe(1)
  wrapper.unmount()
})

test('dispatching the same diff payload again renders against the current doc', async () => {
  // Yjs can only render a snapshot of a doc that keeps its deleted content.
  const doc = new Doc({ gc: false })
  appendParagraph(doc, 'one')
  const { wrapper, editor } = mountCollab(() => ({
    id: 'main',
    doc,
    provider: createProvider(doc).provider,
  }))
  await Promise.resolve()
  expect(textContent(editor())).toBe('one')

  const payload = { prevSnapshot: snapshot(doc) }
  editor().dispatchCommand(DIFF_VERSIONS_COMMAND__EXPERIMENTAL, payload)
  await nextTick()
  appendParagraph(doc, 'two')
  await Promise.resolve()
  expect(textContent(editor())).toBe('one')

  editor().dispatchCommand(DIFF_VERSIONS_COMMAND__EXPERIMENTAL, payload)
  await nextTick()
  await Promise.resolve()
  expect(textContent(editor())).toContain('two')
  wrapper.unmount()
})
