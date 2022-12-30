<script setup lang="ts">
import { onMounted, provide } from 'vue'
import type { EditorThemeClasses, LexicalEditor, LexicalNode } from 'lexical'
import { $createParagraphNode, $getRoot, $getSelection, createEditor } from 'lexical'
import { editorKey } from '../composables/inject'
import type { Class, InitialEditorStateType } from '../types'

const props = defineProps<{
  initialConfig: {
    namespace?: string
    nodes?: Class<LexicalNode>[]
    editable?: boolean
    theme?: EditorThemeClasses
    editorState?: InitialEditorStateType
  }
}>()

const emit = defineEmits<{
  (e: 'error', error: Error): void
}>()

const HISTORY_MERGE_OPTIONS = { tag: 'history-merge' }

const editor = createEditor({
  editable: false,
  namespace: props.initialConfig.namespace,
  nodes: props.initialConfig.nodes,
  theme: props.initialConfig.theme,
  onError(error) {
    emit('error', error)
  },
})
initializeEditor(editor, props.initialConfig.editorState)

function initializeEditor(
  editor: LexicalEditor,
  initialEditorState?: InitialEditorStateType,
): void {
  if (initialEditorState === null)
    return

  if (initialEditorState === undefined) {
    editor.update(() => {
      const root = $getRoot()
      if (root.isEmpty()) {
        const paragraph = $createParagraphNode()
        root.append(paragraph)
        const activeElement = document.activeElement
        if (
          $getSelection() !== null
          || (activeElement !== null && activeElement === editor.getRootElement())
        )
          paragraph.select()
      }
    }, HISTORY_MERGE_OPTIONS)
  }
  else if (initialEditorState !== null) {
    switch (typeof initialEditorState) {
      case 'string': {
        const parsedEditorState = editor.parseEditorState(initialEditorState)
        editor.setEditorState(parsedEditorState, HISTORY_MERGE_OPTIONS)
        break
      }
      case 'object': {
        editor.setEditorState(initialEditorState, HISTORY_MERGE_OPTIONS)
        break
      }
      case 'function': {
        editor.update(() => {
          const root = $getRoot()
          if (root.isEmpty())
            initialEditorState(editor)
        }, HISTORY_MERGE_OPTIONS)
        break
      }
    }
  }
}

provide(editorKey, editor)

onMounted(() => {
  const isEditable = props.initialConfig.editable

  editor.setEditable(isEditable || false)
})
</script>

<template>
  <slot />
</template>
