import type { Binding, ExcludedProperties, Provider, SyncCursorPositionsFn } from '@lexical/yjs'

import type { Ref } from 'vue'
import type { Doc } from 'yjs'
import type { InitialEditorStateType } from './types'
import { createBinding } from '@lexical/yjs'
import { ref, watchEffect } from 'vue'
import {
  useYjsCollaboration,
  useYjsFocusTracking,
  useYjsHistory,
} from './composables'
import { collaborationContext } from './composables/useCollaborationContext'
import { useLexicalComposer } from './LexicalComposer.vine'

type ProviderFactory = (id: string, yjsDocMap: Map<string, Doc>) => Provider

interface LexicalCollaborationPluginProps {
  id: string
  providerFactory: ProviderFactory
  shouldBootstrap: boolean
  username?: string
  cursorColor?: string
  cursorsContainerRef?: HTMLElement | null
  initialEditorState?: InitialEditorStateType
  excludedProperties?: ExcludedProperties
  // `awarenessData` parameter allows arbitrary data to be added to the awareness.
  awarenessData?: object
  syncCursorPositionsFn?: SyncCursorPositionsFn
}

export function LexicalCollaborationPlugin(props: LexicalCollaborationPluginProps) {
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
