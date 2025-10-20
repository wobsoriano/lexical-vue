import type { EditorSetOptions, EditorState, LexicalCommand } from 'lexical'
import type { LexicalCommandLog } from '../shared/useLexicalCommandsLog'
import { computed, ref, useTemplateRef, watchEffect } from 'vue'

interface LexicalTreeViewProps {
  editorState: EditorState
  treeTypeButtonClassName?: string
  timeTravelButtonClassName?: string
  timeTravelPanelButtonClassName?: string
  timeTravelPanelClassName?: string
  timeTravelPanelSliderClassName?: string
  viewClassName?: string
  generateContent: (exportDOM: boolean) => Promise<string>
  setEditorState: (state: EditorState, options?: EditorSetOptions) => void
  setEditorReadOnly: (isReadonly: boolean) => void
  commandsLog?: ReadonlyArray<{
    index: number
  } & LexicalCommand<unknown> & {
    payload: unknown
  }>
}

const LARGE_EDITOR_STATE_SIZE = 1000

export function TreeViewCore(props: LexicalTreeViewProps) {
  const preRef = useTemplateRef('preRef')

  vineExpose({
    preRef,
  })

  const timeStampedEditorStates = ref<Array<[number, EditorState]>>([])
  const content = ref('')
  const timeTravelEnabled = ref(false)
  const showExportDOM = ref(false)
  const playingIndexRef = ref(0)
  const inputRef = ref<HTMLInputElement | null>(null)
  const isPlaying = ref(false)
  const isLimited = ref(false)
  const showLimited = ref(false)
  const lastEditorStateRef = ref<EditorState | null>(null)
  const lastCommandsLogRef = ref<LexicalCommandLog>([])
  const lastGenerationID = ref(0)

  const totalEditorStates = computed(() => timeStampedEditorStates.value.length)

  const generateTree = async (exportDOM: boolean) => {
    const myID = ++lastGenerationID.value
    try {
      const treeText = await props.generateContent(exportDOM)
      if (myID === lastGenerationID.value) {
        content.value = treeText
      }
    }
    catch (err) {
      if (myID === lastGenerationID.value) {
        content.value = `Error rendering tree: ${err instanceof Error ? err.message : String(err)}\n\nStack:\n${err instanceof Error ? err.stack : 'No stack trace'}`
      }
    }
  }

  watchEffect(() => {
    if (!showLimited.value && props.editorState._nodeMap.size > LARGE_EDITOR_STATE_SIZE) {
      isLimited.value = true
      if (!showLimited) {
        return
      }
    }

    // Update view when either editor state changes or new commands are logged
    const shouldUpdate
      = lastEditorStateRef.value !== props.editorState
        || lastCommandsLogRef.value !== props.commandsLog

    if (shouldUpdate) {
      // Check if it's a real editor state change
      const isEditorStateChange = lastEditorStateRef.value !== props.editorState

      lastEditorStateRef.value = props.editorState
      lastCommandsLogRef.value = props.commandsLog || []
      generateTree(showExportDOM.value)

      // Only record in time travel if there was an actual editor state change
      if (!timeTravelEnabled && isEditorStateChange) {
        timeStampedEditorStates.value = [
          ...timeStampedEditorStates.value,
          [Date.now(), props.editorState],
        ]
      }
    }
  })

  watchEffect((onInvalidate) => {
    if (isPlaying.value) {
      let timeoutId: ReturnType<typeof setTimeout>

      const play = () => {
        const currentIndex = playingIndexRef.value

        if (currentIndex === totalEditorStates.value - 1) {
          isPlaying.value = false
          return
        }

        const currentTime = timeStampedEditorStates.value[currentIndex][0]
        const nextTime = timeStampedEditorStates.value[currentIndex + 1][0]
        const timeDiff = nextTime - currentTime
        timeoutId = setTimeout(() => {
          playingIndexRef.value++
          const index = playingIndexRef.value
          const input = inputRef.value

          if (input !== null) {
            input.value = String(index)
          }

          props.setEditorState(timeStampedEditorStates.value[index][1])
          play()
        }, timeDiff)
      }

      play()

      onInvalidate(() => {
        clearTimeout(timeoutId)
      })
    }
  })

  const handleExportModeToggleClick = () => {
    generateTree(!showExportDOM.value)
    showExportDOM.value = !showExportDOM.value
  }

  const handleTimeTravelClick = () => {
    props.setEditorReadOnly(true)
    playingIndexRef.value = totalEditorStates.value - 1
    timeTravelEnabled.value = true
  }

  const handlePlayPauseClick = () => {
    if (playingIndexRef.value === totalEditorStates.value - 1) {
      playingIndexRef.value = 1
    }
    isPlaying.value = !isPlaying.value
  }

  const handleSliderChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const editorStateIndex = Number(target.value)
    const timeStampedEditorState = timeStampedEditorStates.value[editorStateIndex]
    if (timeStampedEditorState) {
      playingIndexRef.value = editorStateIndex
      props.setEditorState(timeStampedEditorState[1])
    }
  }

  const handleExitTimeTravel = () => {
    props.setEditorReadOnly(false)
    const index = timeStampedEditorStates.value.length - 1
    const timeStampedEditorState = timeStampedEditorStates.value[index]
    props.setEditorState(timeStampedEditorState[1])
    const input = inputRef.value
    if (input !== null) {
      input.value = String(index)
    }
    timeTravelEnabled.value = false
    isPlaying.value = false
  }

  const handleShowFullTree = () => {
    showLimited.value = true
  }

  return vine`
    <div :class="viewClassName">
      <!-- Large EditorState Warning -->
      <div v-if="!showLimited && isLimited" style="padding: 20px;">
        <span style="margin-right: 20px;">
          Detected large EditorState, this can impact debugging performance.
        </span>
        <button
          @click="handleShowFullTree"
          style="background: transparent; border: 1px solid white; color: white; cursor: pointer; padding: 5px;"
        >
          Show full tree
        </button>
      </div>

      <!-- Export Mode Toggle -->
      <button
        v-if="!showLimited"
        @click="handleExportModeToggleClick"
        :class="treeTypeButtonClassName"
        type="button"
      >
        {{ showExportDOM ? 'Tree' : 'Export DOM' }}
      </button>

      <!-- Time Travel Button -->
      <button
        v-if="!timeTravelEnabled && (showLimited || !isLimited) && totalEditorStates > 2"
        @click="handleTimeTravelClick"
        :class="timeTravelButtonClassName"
        type="button"
      >
        Time Travel
      </button>

      <!-- Tree Content -->
      <pre ref="preRef" v-if="showLimited || !isLimited">{{ content }}</pre>

      <!-- Time Travel Panel -->
      <div v-if="timeTravelEnabled && (showLimited || !isLimited)" :class="timeTravelPanelClassName">
        <button
          :class="timeTravelPanelButtonClassName"
          @click="handlePlayPauseClick"
          type="button"
        >
          {{ isPlaying ? 'Pause' : 'Play' }}
        </button>
        
        <input
          :class="timeTravelPanelSliderClassName"
          ref="inputRef"
          @change="handleSliderChange"
          type="range"
          min="1"
          :max="totalEditorStates - 1"
        />
        
        <button
          :class="timeTravelPanelButtonClassName"
          @click="handleExitTimeTravel"
          type="button"
        >
          Exit
        </button>
      </div>
    </div>
  `
}
