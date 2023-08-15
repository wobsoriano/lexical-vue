<script setup lang="ts">
import type { Doc } from 'yjs'

import type { ExcludedProperties, Provider } from '@lexical/yjs'
import { computed, watchEffect } from 'vue'
import type { CursorsContainerRef } from '../composables'
import {
  useEditor,
  useEffect,
  useYjsCollaboration,
  useYjsFocusTracking,
  useYjsHistory,
} from '../composables'
import type { InitialEditorStateType } from '../types'
import collaborationContext from '../composables/useCollaborationContext'

const props = defineProps<{
  id: string
  providerFactory: (id: string, yjsDocMap: Map<string, Doc>) => Provider
  shouldBootstrap: boolean
  username?: string
  cursorColor?: string
  cursorsContainerRef?: CursorsContainerRef
  initialEditorState?: InitialEditorStateType
  excludedProperties?: ExcludedProperties
  // `awarenessData` parameter allows arbitrary data to be added to the awareness.
  awarenessData?: object
}>()

watchEffect(() => {
  if (props.username !== undefined)
    collaborationContext.value.name = props.username
  if (props.cursorColor !== undefined)
    collaborationContext.value.color = props.cursorColor
})

const editor = useEditor()

useEffect(() => {
  collaborationContext.value.isCollabActive = true

  return () => {
    // Reseting flag only when unmount top level editor collab plugin. Nested
    // editors (e.g. image caption) should unmount without affecting it
    if (editor._parentEditor == null)
      collaborationContext.value.isCollabActive = false
  }
})

const provider = computed(() => props.providerFactory(props.id, collaborationContext.value.yjsDocMap))

const [cursors, binding] = useYjsCollaboration(
  editor,
  props.id,
  provider.value,
  collaborationContext.value.yjsDocMap,
  collaborationContext.value.name,
  collaborationContext.value.color,
  props.shouldBootstrap,
  props.cursorsContainerRef,
  props.initialEditorState,
  props.excludedProperties,
  props.awarenessData,
)

watchEffect(() => {
  collaborationContext.value.clientID = binding.value.clientID
})

useYjsHistory(editor, binding.value)
useYjsFocusTracking(
  editor,
  provider.value,
  collaborationContext.value.name,
  collaborationContext.value.color,
  props.awarenessData,
)

defineExpose({
  cursors,
})
</script>
