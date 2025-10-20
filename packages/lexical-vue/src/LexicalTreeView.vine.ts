import type { EditorState, LexicalEditor } from 'lexical'
import type { CustomPrintNodeFn } from './shared/generateContent.vine'
import { mergeRegister } from '@lexical/utils'
import { onMounted, onUnmounted, ref, useTemplateRef, watchEffect } from 'vue'
import { generateContent } from './shared/generateContent.vine'
import { TreeViewCore } from './shared/TreeViewCore.vine'
import { useLexicalCommandsLog } from './shared/useLexicalCommandsLog'

export function LexicalTreeView(props: {
  editor: LexicalEditor
  treeTypeButtonClassName?: string
  timeTravelButtonClassName?: string
  timeTravelPanelButtonClassName?: string
  timeTravelPanelClassName?: string
  timeTravelPanelSliderClassName?: string
  viewClassName?: string
  customPrintNode?: CustomPrintNodeFn
}) {
  const treeElementRef = useTemplateRef('treeViewCore')

  const editorCurrentState = ref<EditorState | null>(props.editor.getEditorState())

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
      element.__lexicalEditor = editor

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

  return vine`
    <TreeViewCore
        ref="treeViewCore"
        :tree-type-button-class-name
        :time-travel-button-class-name
        :time-travel-panel-slider-class-name
        :time-travel-panel-button-class-name
        :view-class-name
        :time-travel-panel-class-name
        :set-editor-readonly="handleEditorReadOnly"
        :editor-state="editorCurrentState"
        :set-editor-state="(state) => editor.setEditorState(state)"
        :generate-content="async (exportDOM) => generateContent(editor, commandsLog, exportDOM, customPrintNode)"
        :commands-log
    />
  `
}
