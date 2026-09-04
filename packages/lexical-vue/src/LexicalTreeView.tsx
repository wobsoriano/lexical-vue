import type { EditorState, LexicalEditor } from 'lexical'
import type { CustomPrintNodeFn } from './shared/generateContent'
import { mergeRegister } from '@lexical/utils'
import { defineComponent, h, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { generateContent } from './shared/generateContent'
import { TreeViewCore } from './shared/TreeViewCore'
import { useLexicalCommandsLog } from './shared/useLexicalCommandsLog'

export interface TreeViewProps {
  editor: LexicalEditor
  treeTypeButtonClassName?: string
  timeTravelButtonClassName?: string
  timeTravelPanelButtonClassName?: string
  timeTravelPanelClassName?: string
  timeTravelPanelSliderClassName?: string
  viewClassName?: string
  customPrintNode?: CustomPrintNodeFn
}

export const TreeView = defineComponent(
  (props: TreeViewProps) => {
    const treeElementRef = ref<{ preRef: HTMLPreElement | null } | null>(null)

    const editorCurrentState = ref<EditorState>(props.editor.getEditorState())

    const commandsLog = useLexicalCommandsLog(props.editor)

    onMounted(() => {
      // Registers listeners to update the tree view when the editor state changes
      const unregister = mergeRegister(
        props.editor.registerUpdateListener(({ editorState }) => {
          editorCurrentState.value = editorState
        }),
        props.editor.registerEditableListener(() => {
          editorCurrentState.value = props.editor.getEditorState()
        }),
      )

      onUnmounted(unregister)
    })

    watchEffect((onInvalidate) => {
      const element = treeElementRef.value?.preRef

      if (element) {
        // Assigns the editor instance to the tree view DOM element for internal tracking
        // @ts-expect-error Internal field used by Lexical
        element.__lexicalEditor = props.editor

        onInvalidate(() => {
          // Cleans up the reference when the component is unmounted
          // @ts-expect-error Internal field used by Lexical
          element.__lexicalEditor = null
        })
      }
    })

    /**
     * Handles toggling the readonly state of the editor.
     *
     * @param {boolean} isReadonly - Whether the editor should be set to readonly.
     */
    function handleEditorReadOnly(isReadonly: boolean) {
      const rootElement = props.editor.getRootElement()
      if (rootElement == null) {
        return
      }

      rootElement.contentEditable = isReadonly ? 'false' : 'true'
    }

    return () =>
      h(TreeViewCore, {
        ref: treeElementRef,
        treeTypeButtonClassName: props.treeTypeButtonClassName,
        timeTravelButtonClassName: props.timeTravelButtonClassName,
        timeTravelPanelSliderClassName: props.timeTravelPanelSliderClassName,
        timeTravelPanelButtonClassName: props.timeTravelPanelButtonClassName,
        viewClassName: props.viewClassName,
        timeTravelPanelClassName: props.timeTravelPanelClassName,
        setEditorReadOnly: handleEditorReadOnly,
        editorState: editorCurrentState.value,
        setEditorState: (state: EditorState) => props.editor.setEditorState(state),
        generateContent: async (exportDOM: boolean) =>
          generateContent(props.editor, commandsLog.value, exportDOM, props.customPrintNode),
        commandsLog: commandsLog.value,
      })
  },
  {
    name: 'TreeView',
    props: [
      'editor',
      'treeTypeButtonClassName',
      'timeTravelButtonClassName',
      'timeTravelPanelButtonClassName',
      'timeTravelPanelClassName',
      'timeTravelPanelSliderClassName',
      'viewClassName',
      'customPrintNode',
    ],
  },
)
