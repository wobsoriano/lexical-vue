import type { EditorState, EditorThemeClasses, HTMLConfig, Klass, LexicalEditor, LexicalNode, LexicalNodeReplacement } from 'lexical'
import type { InjectionKey } from 'vue'
import { CAN_USE_DOM } from '@lexical/utils'
import { $createParagraphNode, $getRoot, $getSelection, createEditor, HISTORY_MERGE_TAG } from 'lexical'
import invariant from 'tiny-invariant'
import { inject, onMounted, provide } from 'vue'

const lexicalEditorKey = Symbol('LexicalEditor') as InjectionKey<LexicalEditor>

export type InitialEditorStateType
  = | null
    | string
    | EditorState
    | ((editor: LexicalEditor) => void)

export type InitialConfigType = Readonly<{
  namespace: string
  nodes?: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement>
  onError: (error: Error, editor: LexicalEditor) => void
  editable?: boolean
  theme?: EditorThemeClasses
  editorState?: InitialEditorStateType
  html?: HTMLConfig
}>

export function LexicalComposer(props: {
  initialConfig: InitialConfigType
}) {
  const HISTORY_MERGE_OPTIONS = { tag: HISTORY_MERGE_TAG }

  const {
    theme,
    namespace,
    nodes,
    onError,
    editorState: initialEditorState,
    html,
  } = props.initialConfig

  const emit = vineEmits<{
    error?: [error: Error, editor: LexicalEditor]
  }>()

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
          const activeElement = CAN_USE_DOM ? document.activeElement : null
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

  provide(lexicalEditorKey, editor)

  onMounted(() => {
    const isEditable = props.initialConfig.editable

    editor.setEditable(isEditable !== undefined ? isEditable : true)
  })

  vineSlots<{
    default: () => any
  }>()

  return vine`
    <slot />
  `
}

export function useLexicalComposer() {
  const editor = inject(lexicalEditorKey, null)

  if (!editor) {
    invariant(
      false,
      'useLexicalComposer: cannot find a LexicalComposer',
    )
  }

  return editor
}
