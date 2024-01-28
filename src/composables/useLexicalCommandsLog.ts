import { COMMAND_PRIORITY_HIGH, type LexicalCommand, type LexicalEditor } from 'lexical'
import { readonly, ref } from 'vue'
import { useMounted } from './useMounted'

export function useLexicalCommandsLog(
  editor: LexicalEditor,
) {
  const loggedCommands = ref<Array<LexicalCommand<unknown> & { payload: unknown }>>([])

  useMounted(() => {
    const unregisterCommandListeners = new Set<() => void>()

    for (const [command] of editor._commands) {
      unregisterCommandListeners.add(
        editor.registerCommand(
          command,
          (payload) => {
            loggedCommands.value = [
              ...loggedCommands.value,
              {
                payload,
                type: command.type ? command.type : 'UNKNOWN',
              },
            ]

            if (loggedCommands.value.length > 10)
              loggedCommands.value.shift()

            return false
          },
          COMMAND_PRIORITY_HIGH,
        ),
      )
    }

    return () => {
      unregisterCommandListeners.forEach(unregister => unregister())
    }
  })

  return readonly(loggedCommands)
}
