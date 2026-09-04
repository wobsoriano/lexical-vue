import type {
  EditorState,
  EditorThemeClasses,
  HTMLConfig,
  Klass,
  LexicalEditor,
  LexicalNode,
  LexicalNodeReplacement,
} from 'lexical'
import { CAN_USE_DOM } from '@lexical/utils'
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  createEditor,
  getActiveElement,
  HISTORY_MERGE_TAG,
} from 'lexical'
import invariant from 'tiny-invariant'
import { defineComponent, inject, onMounted, provide } from 'vue'
import { lexicalEditorKey } from './shared/editorContext'

export type InitialEditorStateType = null | string | EditorState | ((editor: LexicalEditor) => void)

export type InitialConfigType = Readonly<{
  namespace: string
  nodes?: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement>
  onError: (error: Error, editor: LexicalEditor) => void
  onWarn?: (error: Error, editor: LexicalEditor) => void
  editable?: boolean
  theme?: EditorThemeClasses
  editorState?: InitialEditorStateType
  html?: HTMLConfig
}>

export const LexicalComposer = defineComponent(
  (
    props: { initialConfig: InitialConfigType },
    ctx: {
      emit: (event: 'error', error: Error, editor: LexicalEditor) => void
      slots: { default?: () => any }
    },
  ) => {
    const HISTORY_MERGE_OPTIONS = { tag: HISTORY_MERGE_TAG }

    const {
      theme,
      namespace,
      nodes,
      onError,
      onWarn,
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
        ctx.emit('error', error, editor)
        onError?.(error, editor)
      },
      ...(onWarn
        ? {
            onWarn(error: Error) {
              onWarn(error, editor)
            },
          }
        : {}),
    })

    initializeEditor(editor, initialEditorState)

    function initializeEditor(
      editor: LexicalEditor,
      initialEditorState?: InitialEditorStateType,
    ): void {
      if (initialEditorState === null) return

      if (initialEditorState === undefined) {
        editor.update(() => {
          const root = $getRoot()
          if (root.isEmpty()) {
            const paragraph = $createParagraphNode()
            root.append(paragraph)
            const rootElement = editor.getRootElement()
            const activeElement =
              CAN_USE_DOM && rootElement !== null ? getActiveElement(rootElement) : null
            if (
              $getSelection() !== null ||
              (activeElement !== null && activeElement === rootElement)
            ) {
              paragraph.select()
            }
          }
        }, HISTORY_MERGE_OPTIONS)
      } else if (initialEditorState !== null) {
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
              if (root.isEmpty()) initialEditorState(editor)
            }, HISTORY_MERGE_OPTIONS)
            break
          }
        }
      }
    }

    provide(lexicalEditorKey, editor)

    onMounted(() => {
      const isEditable = props.initialConfig.editable

      editor.setEditable(isEditable !== undefined ? isEditable : true)
    })

    return () => ctx.slots.default?.()
  },
  {
    name: 'LexicalComposer',
    props: ['initialConfig'],
    emits: { error: (_error: Error, _editor: LexicalEditor) => true },
  },
)

export function useLexicalComposer() {
  const editor = inject(lexicalEditorKey, null)

  if (!editor) {
    invariant(false, 'useLexicalComposer: cannot find a LexicalComposer')
  }

  return editor
}
