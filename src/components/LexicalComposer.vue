<script setup lang="ts">
import { onMounted, provide } from 'vue'
import type { EditorThemeClasses, HTMLConfig, Klass, LexicalEditor, LexicalNode, LexicalNodeReplacement } from 'lexical'
import { $createParagraphNode, $getRoot, $getSelection, createEditor } from 'lexical'
import { LexicalEditorProviderKey } from '../composables/inject'
import type { InitialEditorStateType } from '../types'

export type InitialConfigType = Readonly<{
  namespace: string
  nodes?: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement>
  onError: (error: Error, editor: LexicalEditor) => void
  editable?: boolean
  theme?: EditorThemeClasses
  editorState?: InitialEditorStateType
  html?: HTMLConfig
}>

const props = defineProps<{
  initialConfig: InitialConfigType
}>()

const emit = defineEmits<{
  (e: 'error', error: Error, editor: LexicalEditor): void
}>()

const HISTORY_MERGE_OPTIONS = { tag: 'history-merge' }

const {
  theme,
  namespace,
  nodes,
  onError,
  editorState: initialEditorState,
  html,
} = props.initialConfig

const editor = createEditor({
  editable: props.initialConfig.editable,
  html,
  namespace,
  nodes,
  theme,
  onError(error) {
    emit('error', error, editor)
    onError?.(error, editor)
  },
})

initializeEditor(editor, initialEditorState)

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
        ) {
          paragraph.select()
        }
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

provide<LexicalEditor>(LexicalEditorProviderKey, editor)

onMounted(() => {
  const isEditable = props.initialConfig.editable

  editor.setEditable(isEditable !== undefined ? isEditable : true)
})
</script>

<template>
  <slot />
</template>
