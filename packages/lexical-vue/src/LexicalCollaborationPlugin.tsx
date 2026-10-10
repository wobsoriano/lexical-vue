import type {
  BaseBinding,
  Binding,
  BindingV2,
  ExcludedProperties,
  Provider,
  UserState,
} from '@lexical/yjs'

import type { LexicalEditor } from 'lexical'
import type { Doc, XmlElement } from 'yjs'
import type { InitialEditorStateType } from './types'
import { createYjsBinding } from '@lexical/yjs'
import { defineComponent, h, onUnmounted, shallowRef, toRaw, watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer'
import { collaborationContext } from './shared/useCollaborationContext'
import {
  useYjsCollaboration,
  useYjsCollaborationV2__EXPERIMENTAL,
  useYjsCursors,
  useYjsFocusTracking,
  useYjsHistory,
  useYjsHistoryV2,
} from './shared/useYjsCollaboration'

type AnyBinding = Binding | BindingV2
interface SyncCursorPositionsOptions {
  getAwarenessStates?: (binding: BaseBinding, provider: Provider) => Map<number, UserState>
  selectionHighlight?: boolean
}
interface CollaborationPluginProps {
  id: string
  providerFactory: (id: string, yjsDocMap: Map<string, Doc>) => Provider
  shouldBootstrap: boolean
  username?: string
  cursorColor?: string
  cursorsContainerRef?: HTMLElement | null
  initialEditorState?: InitialEditorStateType
  excludedProperties?: ExcludedProperties
  // `awarenessData` parameter allows arbitrary data to be added to the awareness.
  awarenessData?: object
  syncCursorPositionsFn?: (
    binding: AnyBinding,
    provider: Provider,
    options?: SyncCursorPositionsOptions,
  ) => void
  selectionHighlight?: boolean
  rootName?: string
}

export const CollaborationPlugin = defineComponent(
  (props: CollaborationPluginProps) => {
    useCollaborationContextProps(props)
    const editor = useLexicalComposer()
    useCollabActive(editor)

    const id = props.id
    const yjsDocMap = collaborationContext.value.yjsDocMap
    const provider = shallowRef(props.providerFactory(id, yjsDocMap))
    const doc = shallowRef(yjsDocMap.get(id)!)
    const binding = shallowRef(
      createYjsBinding({
        doc: doc.value,
        docMap: yjsDocMap,
        editor,
        excludedProperties: props.excludedProperties,
        id,
        rootName: props.rootName,
      }),
    )

    onUnmounted(() => {
      binding.value.root.destroy(binding.value)
      provider.value.disconnect()
    })

    const cursors = useYjsCollaboration(
      editor,
      () => id,
      provider,
      () => yjsDocMap,
      () => collaborationContext.value.name,
      () => collaborationContext.value.color,
      () => props.shouldBootstrap,
      binding,
      doc,
      () => props.cursorsContainerRef as HTMLElement,
      () => props.initialEditorState,
      () => props.awarenessData,
      () => props.syncCursorPositionsFn,
      () => props.selectionHighlight,
    )

    useYjsHistory(editor, binding)
    useYjsFocusTracking(
      editor,
      provider,
      () => collaborationContext.value.name,
      () => collaborationContext.value.color,
      () => props.awarenessData,
    )

    return () => (cursors.value ? h(cursors.value) : null)
  },
  {
    name: 'CollaborationPlugin',
    props: [
      'id',
      'providerFactory',
      'shouldBootstrap',
      'username',
      'cursorColor',
      'cursorsContainerRef',
      'initialEditorState',
      'excludedProperties',
      'awarenessData',
      'syncCursorPositionsFn',
      'selectionHighlight',
      'rootName',
    ],
  },
)

export interface CollaborationPluginV2Props {
  id: string
  /** Caller-owned document; use the same document as the provider. */
  doc: Doc
  /** The plugin connects/disconnects this provider but does not destroy it or the document. */
  provider: Provider
  /**
   * Seed an empty root after the provider reports sync. Only one client may opt in
   * per document: concurrent seeds are ordinary Yjs inserts and both are retained.
   * Prefer initializing shared content server-side, especially for nested editors.
   */
  __shouldBootstrapUnsafe?: boolean
  username?: string
  cursorColor?: string
  cursorsContainerRef?: HTMLElement | null
  excludedProperties?: ExcludedProperties
  /** Arbitrary data published with the local user's awareness state. */
  awarenessData?: object
  /** Opt in to CSS Highlights selection rendering, with a legacy fallback. */
  selectionHighlight?: boolean
  /** Top-level shared root key; defaults to 'root-v2'. Read once per editor mount. */
  rootName?: string
  /**
   * Resolve an integrated root created with new XmlElement() without a nodeName.
   * Overrides rootName. Called once before the provider connects, so the root must
   * already be available locally. Return the same root for the same document;
   * never share it between multiple live bindings in one editor session.
   * Remount the whole editor to change roots, not just this plugin: otherwise the
   * previous editor content can be written into the new root.
   */
  getXmlElement?: (doc: Doc) => XmlElement
}

/**
 * Experimental V2 binding with a caller-owned document and provider.
 * Remount the editor, not just this plugin, to change the document or root.
 * The API may change in a future release.
 */
export const CollaborationPluginV2__EXPERIMENTAL = defineComponent(
  (props: CollaborationPluginV2Props) => {
    const editor = useLexicalComposer()
    const provider = shallowRef(toRaw(props.provider))
    const doc = toRaw(props.doc)
    const docMap = toRaw(collaborationContext.value.yjsDocMap)

    useCollaborationContextProps(props)
    useCollabActive(editor)

    const binding = useYjsCollaborationV2__EXPERIMENTAL(
      editor,
      props.id,
      doc,
      provider.value,
      docMap,
      () => collaborationContext.value.name,
      () => collaborationContext.value.color,
      props,
    )
    useYjsHistoryV2(editor, binding)
    useYjsFocusTracking(
      editor,
      provider,
      () => collaborationContext.value.name,
      () => collaborationContext.value.color,
      () => props.awarenessData,
    )
    const cursors = useYjsCursors(binding, () => props.cursorsContainerRef ?? null)
    return () => cursors.value
  },
  {
    name: 'CollaborationPluginV2__EXPERIMENTAL',
    props: [
      'id',
      'doc',
      'provider',
      '__shouldBootstrapUnsafe',
      'username',
      'cursorColor',
      'cursorsContainerRef',
      'excludedProperties',
      'awarenessData',
      'selectionHighlight',
      'rootName',
      'getXmlElement',
    ],
  },
)

function useCollaborationContextProps(props: { username?: string; cursorColor?: string }) {
  watchEffect(() => {
    if (props.username !== undefined) collaborationContext.value.name = props.username
    if (props.cursorColor !== undefined) collaborationContext.value.color = props.cursorColor
  })
}

function useCollabActive(editor: LexicalEditor) {
  watchEffect((onInvalidate) => {
    collaborationContext.value.isCollabActive = true
    onInvalidate(() => {
      // Nested editor cleanup must not deactivate its parent editor's collaboration.
      if (editor._parentEditor == null) collaborationContext.value.isCollabActive = false
    })
  })
}
