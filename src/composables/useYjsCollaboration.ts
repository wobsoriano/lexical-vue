import type { BaseBinding, Binding, Provider, SyncCursorPositionsFn } from '@lexical/yjs'
import type { LexicalEditor } from 'lexical'

import { mergeRegister } from '@lexical/utils'
import {
  CONNECTED_COMMAND,
  createUndoManager,
  initLocalState,
  setLocalStateFocus,
  syncCursorPositions,
  syncLexicalUpdateToYjs,
  syncYjsChangesToLexical,
} from '@lexical/yjs'
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  BLUR_COMMAND,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  FOCUS_COMMAND,
  HISTORY_MERGE_TAG,
  REDO_COMMAND,
  SKIP_COLLAB_TAG,
  UNDO_COMMAND,
} from 'lexical'
import type { Doc, Transaction, YEvent } from 'yjs'
import { UndoManager } from 'yjs'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { Teleport, computed, h, ref, toValue, watchEffect } from 'vue'
import type { InitialEditorStateType } from '../types'
import { useEffect } from './useEffect'

type OnYjsTreeChanges = (
  // The below `any` type is taken directly from the vendor types for YJS.
  events: Array<YEvent<any>>,
  transaction: Transaction,
) => void

export function useYjsCollaboration(
  editor: LexicalEditor,
  id: MaybeRefOrGetter<string>,
  provider: Ref<Provider>,
  docMap: MaybeRefOrGetter<Map<string, Doc>>,
  name: MaybeRefOrGetter<string>,
  color: MaybeRefOrGetter<string>,
  shouldBootstrap: MaybeRefOrGetter<boolean>,
  binding: MaybeRefOrGetter<Binding>,
  doc: Ref<Doc | null>,
  cursorsContainerRef?: MaybeRefOrGetter<HTMLElement | null>,
  initialEditorState?: MaybeRefOrGetter<InitialEditorStateType>,
  awarenessData?: MaybeRefOrGetter<object>,
  syncCursorPositionsFn: SyncCursorPositionsFn = syncCursorPositions,
) {
  const isReloadingDoc = ref(false)

  const onBootstrap = () => {
    const { root } = toValue(binding)
    if (shouldBootstrap && root.isEmpty() && root._xmlText._length === 0) {
      initializeEditor(editor, toValue(initialEditorState))
    }
  }

  watchEffect((onInvalidate) => {
    const { root } = toValue(binding)

    const onYjsTreeChanges: OnYjsTreeChanges = (events, transaction) => {
      const origin = transaction.origin
      if (origin !== binding) {
        const isFromUndoManger = origin instanceof UndoManager
        syncYjsChangesToLexical(
          toValue(binding),
          provider.value,
          events,
          isFromUndoManger,
          syncCursorPositionsFn,
        )
      }
    }

    root.getSharedType().observeDeep(onYjsTreeChanges)
    const removeListener = editor.registerUpdateListener(
      ({
        prevEditorState,
        editorState,
        dirtyLeaves,
        dirtyElements,
        normalizedNodes,
        tags,
      }) => {
        if (!tags.has(SKIP_COLLAB_TAG)) {
          syncLexicalUpdateToYjs(
            toValue(binding),
            provider.value,
            prevEditorState,
            editorState,
            dirtyElements,
            dirtyLeaves,
            normalizedNodes,
            tags,
          )
        }
      },
    )

    onInvalidate(() => {
      root.getSharedType().unobserveDeep(onYjsTreeChanges)
      removeListener()
    })
  })

  // Note: 'reload' is not an actual Yjs event type. Included here for legacy support (#1409).
  watchEffect((onInvalidate) => {
    const onProviderDocReload = (ydoc: Doc) => {
      clearEditorSkipCollab(editor, toValue(binding))
      doc.value = ydoc
      toValue(docMap).set(toValue(id), ydoc)
      isReloadingDoc.value = true
    }

    const onSync = () => {
      isReloadingDoc.value = false
    }

    provider.value.on('reload', onProviderDocReload)
    provider.value.on('sync', onSync)

    onInvalidate(() => {
      provider.value.off('reload', onProviderDocReload)
      provider.value.off('sync', onSync)
    })
  })

  useProvider(
    editor,
    provider,
    name,
    color,
    isReloadingDoc,
    awarenessData,
    onBootstrap,
  )

  return useYjsCursors(binding, cursorsContainerRef)
}

export function useProvider(
  editor: LexicalEditor,
  provider: Ref<Provider>,
  name: MaybeRefOrGetter<string>,
  color: MaybeRefOrGetter<string>,
  isReloadingDoc: Ref<boolean>,
  awarenessData?: object,
  onBootstrap?: () => void,
): void {
  const connect = () => provider.value.connect()

  const disconnect = () => {
    try {
      provider.value.disconnect()
    }
    catch {
      // Do nothing
    }
  }

  watchEffect((onInvalidate) => {
    const onStatus = ({ status }: { status: string }) => {
      editor.dispatchCommand(CONNECTED_COMMAND, status === 'connected')
    }

    const onSync = (isSynced: boolean) => {
      if (isSynced && isReloadingDoc.value === false && onBootstrap) {
        onBootstrap()
      }
    }

    initLocalState(
      provider.value,
      toValue(name),
      toValue(color),
      document.activeElement === editor.getRootElement(),
      awarenessData || {},
    )

    provider.value.on('status', onStatus)
    provider.value.on('sync', onSync)

    const connectionPromise = connect()

    onInvalidate(() => {
      if (isReloadingDoc.value === false) {
        if (connectionPromise) {
          connectionPromise.then(disconnect)
        }
        else {
          // Workaround for race condition in StrictMode. It's possible there
          // is a different race for the above case where connect returns a
          // promise, but we don't have an example of that in-repo.
          // It's possible that there is a similar issue with
          // TOGGLE_CONNECT_COMMAND below when the provider connect returns a
          // promise.
          // https://github.com/facebook/lexical/issues/6640
          disconnect()
        }
      }

      provider.value.off('sync', onSync)
      provider.value.off('status', onStatus)
    })
  })

  watchEffect((onInvalidate) => {
    const unregister = editor.registerCommand(
      TOGGLE_CONNECT_COMMAND,
      (payload) => {
        const shouldConnect = payload

        if (shouldConnect) {
          // eslint-disable-next-line no-console
          console.log('Collaboration connected!')
          connect()
        }
        else {
          // eslint-disable-next-line no-console
          console.log('Collaboration disconnected!')
          disconnect()
        }

        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )

    onInvalidate(unregister)
  })
}

export function useYjsCursors(
  binding: MaybeRefOrGetter<BaseBinding>,
  cursorsContainerRef?: Ref<HTMLElement | null>,
) {
  return computed(() => {
    const target = cursorsContainerRef?.value || document.body

    return h(
      Teleport,
      { to: target },
      h('div', {
        ref: (element) => {
          toValue(binding).cursorsContainer = element as null | HTMLElement
        },
      }),
    )
  })
};

export function useYjsFocusTracking(
  editor: LexicalEditor,
  provider: Ref<Provider>,
  name: MaybeRefOrGetter<string>,
  color: MaybeRefOrGetter<string>,
  awarenessData?: object,
) {
  watchEffect((onInvalidate) => {
    const unregister = mergeRegister(
      editor.registerCommand(
        FOCUS_COMMAND,
        () => {
          setLocalStateFocus(provider.value, toValue(name), toValue(color), true, awarenessData || {})
          return false
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        BLUR_COMMAND,
        () => {
          setLocalStateFocus(provider.value, toValue(name), toValue(color), false, awarenessData || {})
          return false
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    )

    onInvalidate(unregister)
  })
}

export function useYjsHistory(editor: LexicalEditor, binding: MaybeRefOrGetter<Binding>): () => void {
  const undoManager = computed(() => createUndoManager(toValue(binding), toValue(binding).root.getSharedType()))

  return useYjsUndoManager(editor, undoManager)
}

export function useYjsUndoManager(editor: LexicalEditor, undoManager: Ref<UndoManager>) {
  watchEffect((onInvalidate) => {
    const undo = () => {
      undoManager.value.undo()
    }

    const redo = () => {
      undoManager.value.redo()
    }

    const unregister = mergeRegister(
      editor.registerCommand(
        UNDO_COMMAND,
        () => {
          undo()
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        REDO_COMMAND,
        () => {
          redo()
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    )

    onInvalidate(unregister)
  })

  const clearHistory = () => {
    undoManager.value.clear()
  }

  // Exposing undo and redo states
  watchEffect((onInvalidate) => {
    const updateUndoRedoStates = () => {
      editor.dispatchCommand(
        CAN_UNDO_COMMAND,
        undoManager.value.undoStack.length > 0,
      )
      editor.dispatchCommand(
        CAN_REDO_COMMAND,
        undoManager.value.redoStack.length > 0,
      )
    }
    undoManager.value.on('stack-item-added', updateUndoRedoStates)
    undoManager.value.on('stack-item-popped', updateUndoRedoStates)
    undoManager.value.on('stack-cleared', updateUndoRedoStates)
    onInvalidate(() => {
      undoManager.value.off('stack-item-added', updateUndoRedoStates)
      undoManager.value.off('stack-item-popped', updateUndoRedoStates)
      undoManager.value.off('stack-cleared', updateUndoRedoStates)
    })
  })

  return clearHistory
}

function initializeEditor(
  editor: LexicalEditor,
  initialEditorState?: InitialEditorStateType,
): void {
  editor.update(
    () => {
      const root = $getRoot()

      if (root.isEmpty()) {
        if (initialEditorState) {
          switch (typeof initialEditorState) {
            case 'string': {
              const parsedEditorState = editor.parseEditorState(initialEditorState)
              editor.setEditorState(parsedEditorState, { tag: HISTORY_MERGE_TAG })
              break
            }
            case 'object': {
              editor.setEditorState(initialEditorState, { tag: HISTORY_MERGE_TAG })
              break
            }
            case 'function': {
              editor.update(
                () => {
                  const root1 = $getRoot()
                  if (root1.isEmpty())
                    initialEditorState(editor)
                },
                { tag: HISTORY_MERGE_TAG },
              )
              break
            }
          }
        }
        else {
          const paragraph = $createParagraphNode()
          root.append(paragraph)
          const { activeElement } = document

          if (
            $getSelection() !== null
            || (activeElement !== null && activeElement === editor.getRootElement())
          ) {
            paragraph.select()
          }
        }
      }
    },
    {
      tag: HISTORY_MERGE_TAG,
    },
  )
}

function clearEditorSkipCollab(editor: LexicalEditor, binding: Binding) {
  // reset editor state
  editor.update(
    () => {
      const root = $getRoot()
      root.clear()
      root.select()
    },
    {
      tag: SKIP_COLLAB_TAG,
    },
  )

  if (binding.cursors == null)
    return

  const cursors = binding.cursors

  if (cursors == null)
    return

  const cursorsContainer = binding.cursorsContainer

  if (cursorsContainer == null)
    return

  // reset cursors in dom
  const cursorsArr = Array.from(cursors.values())

  for (let i = 0; i < cursorsArr.length; i++) {
    const cursor = cursorsArr[i]
    const selection = cursor.selection

    if (selection && selection.selections !== null) {
      const selections = selection.selections

      for (let j = 0; j < selections.length; j++) cursorsContainer.removeChild(selections[i])
    }
  }
}
