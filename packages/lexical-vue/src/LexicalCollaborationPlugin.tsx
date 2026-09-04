import type { BaseBinding, Binding, BindingV2, Provider, UserState } from '@lexical/yjs'

import type { Klass, LexicalNode } from 'lexical'
import type { Doc } from 'yjs'
import type { InitialEditorStateType } from './types'
import { createYjsBinding } from '@lexical/yjs'
import { defineComponent, h, onUnmounted, shallowRef, watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer'
import { collaborationContext } from './shared/useCollaborationContext'
import {
  useYjsCollaboration,
  useYjsFocusTracking,
  useYjsHistory,
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
  excludedProperties?: Map<Klass<LexicalNode>, Set<string>>
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
    // Set username and cursor color
    watchEffect(() => {
      if (props.username !== undefined) collaborationContext.value.name = props.username
      if (props.cursorColor !== undefined) collaborationContext.value.color = props.cursorColor
    })

    const editor = useLexicalComposer()

    watchEffect((onInvalidate) => {
      collaborationContext.value.isCollabActive = true

      onInvalidate(() => {
        // Reseting flag only when unmount top level editor collab plugin. Nested
        // editors (e.g. image caption) should unmount without affecting it
        if (editor._parentEditor == null) collaborationContext.value.isCollabActive = false
      })
    })

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
