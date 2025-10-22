import type { BaseBinding, Binding, BindingV2, Provider, UserState } from '@lexical/yjs'

import type { Klass, LexicalNode } from 'lexical'
import type { Ref } from 'vue'
import type { Doc } from 'yjs'
import type { InitialEditorStateType } from './types'
import { createBinding } from '@lexical/yjs'
import { ref, watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'
import { collaborationContext } from './shared/useCollaborationContext'
import {
  useYjsCollaboration,
  useYjsFocusTracking,
  useYjsHistory,
} from './shared/useYjsCollaboration'

type AnyBinding = Binding | BindingV2
interface SyncCursorPositionsOptions {
  getAwarenessStates?: (binding: BaseBinding, provider: Provider) => Map<number, UserState>
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
  syncCursorPositionsFn?: (binding: AnyBinding, provider: Provider, options?: SyncCursorPositionsOptions) => void
}

export function CollaborationPlugin(props: CollaborationPluginProps) {
  const isBindingInitialized = ref(false)
  const isProviderInitialized = ref(false)

  // Set username and cursor color
  watchEffect(() => {
    if (props.username !== undefined)
      collaborationContext.value.name = props.username
    if (props.cursorColor !== undefined)
      collaborationContext.value.color = props.cursorColor
  })

  const editor = useLexicalComposer()

  watchEffect((onInvalidate) => {
    collaborationContext.value.isCollabActive = true

    onInvalidate(() => {
    // Reseting flag only when unmount top level editor collab plugin. Nested
    // editors (e.g. image caption) should unmount without affecting it
      if (editor._parentEditor == null)
        collaborationContext.value.isCollabActive = false
    })
  })

  const provider = ref() as Ref<Provider>
  const doc = ref() as Ref<Doc>

  watchEffect((onInvalidate) => {
    if (isProviderInitialized.value) {
      return
    }

    isProviderInitialized.value = true

    const newProvider = props.providerFactory(props.id, collaborationContext.value.yjsDocMap)
    provider.value = newProvider
    doc.value = collaborationContext.value.yjsDocMap.get(props.id)!

    onInvalidate(() => {
      newProvider.disconnect()
    })
  })

  const binding = ref() as Ref<Binding>

  watchEffect((onInvalidate) => {
    if (!provider.value) {
      return
    }

    if (isBindingInitialized.value) {
      return
    }

    isBindingInitialized.value = true

    const newBinding = createBinding(
      editor,
      provider.value,
      props.id,
      doc.value || collaborationContext.value.yjsDocMap.get(props.id),
      collaborationContext.value.yjsDocMap,
      props.excludedProperties,
    )
    binding.value = newBinding

    onInvalidate(() => {
      newBinding.root.destroy(newBinding)
    })
  })

  const cursors = useYjsCollaboration(
    editor,
    () => props.id,
    provider,
    () => collaborationContext.value.yjsDocMap,
    () => collaborationContext.value.name,
    () => collaborationContext.value.color,
    () => props.shouldBootstrap,
    binding,
    doc,
    () => props.cursorsContainerRef as HTMLElement,
    () => props.initialEditorState,
    () => props.awarenessData,
    () => props.syncCursorPositionsFn,
  )

  useYjsHistory(editor, binding)
  useYjsFocusTracking(editor, provider, () => collaborationContext.value.name, () => collaborationContext.value.color, props.awarenessData)

  return vine`
    <component :is="cursors" />
  `
}
