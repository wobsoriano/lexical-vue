import type { LexicalCommand, LexicalEditor } from 'lexical'
import { COMMAND_PRIORITY_CRITICAL } from 'lexical'
import { onMounted, onUnmounted, readonly, ref } from 'vue'

export type LexicalCommandLog = ReadonlyArray<{
  index: number
} & LexicalCommand<unknown> & {
  payload: unknown
}>

export function registerLexicalCommandLogger(
  editor: LexicalEditor,
  loggedCommands: { value: LexicalCommandLog },
  setLoggedCommands: (newState: LexicalCommandLog) => void,
): () => void {
  const unregisterCommandListeners = new Set<() => void>()
  let i = 0
  for (const [command] of editor._commands) {
    unregisterCommandListeners.add(
      editor.registerCommand(
        command,
        (payload) => {
          i += 1
          const newState = [...loggedCommands.value]
          newState.push({
            index: i,
            payload,
            type: command.type ? command.type : 'UNKNOWN',
          })

          if (newState.length > 10) {
            newState.shift()
          }

          setLoggedCommands(newState)

          return false
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    )
  }

  return () => unregisterCommandListeners.forEach(unregister => unregister())
}

export function useLexicalCommandsLog(
  editor: LexicalEditor,
) {
  const loggedCommands = ref<LexicalCommandLog>([])

  onMounted(() => {
    const unregister = registerLexicalCommandLogger(
      editor,
      loggedCommands,
      (newState) => {
        loggedCommands.value = newState
      },
    )

    onUnmounted(unregister)
  })

  return readonly(loggedCommands)
}
