import type { BaseBinding, Binding, Provider, SyncCursorPositionsFn } from '@lexical/yjs'
import type { LexicalEditor } from 'lexical'

import type { MaybeRefOrGetter, Ref } from 'vue'
import type { Doc, Transaction, YEvent } from 'yjs'
import type { InitialEditorStateType } from '../types'
import { mergeRegister } from '@lexical/utils'
import {
  CONNECTED_COMMAND,
  createUndoManager,
  initLocalState,
  removeCursorHighlightRule,
  setLocalStateFocus,
  syncCursorPositions,
  syncLexicalUpdateToYjs,
  syncYjsChangesToLexical,
  TOGGLE_CONNECT_COMMAND,
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
  getActiveElement,
  HISTORY_MERGE_TAG,
  REDO_COMMAND,
  registerEventListeners,
  SKIP_COLLAB_TAG,
  UNDO_COMMAND,
} from 'lexical'
import { computed, h, ref, Teleport, toValue, watchEffect } from 'vue'
import { UndoManager } from 'yjs'

type OnYjsTreeChanges = (
  // The below `any` type is taken directly from the vendor types for YJS.
  events: Array<YEvent<any>>,
  transaction: Transaction,
) => void

const COLLAB_UNDO_MANAGER = Symbol.for('@lexical/yjs/UndoManager')

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
  awarenessData?: MaybeRefOrGetter<object | undefined>,
  syncCursorPositionsFn?: MaybeRefOrGetter<SyncCursorPositionsFn | undefined>,
  selectionHighlight?: MaybeRefOrGetter<boolean | undefined>,
) {
  const isReloadingDoc = ref(false)

  const onBootstrap = () => {
    const resolvedBinding = toValue(binding)
    if (!resolvedBinding) {
      return
    }
    const { root } = resolvedBinding
    if (toValue(shouldBootstrap) && root.isEmpty() && root._xmlText._length === 0) {
      initializeEditor(editor, toValue(initialEditorState))
    }
  }

  watchEffect((onInvalidate) => {
    const resolvedBinding = toValue(binding)
    const resolvedProvider = provider.value
    if (!resolvedBinding || !resolvedProvider) {
      return
    }

    const { root } = resolvedBinding

    const onYjsTreeChanges: OnYjsTreeChanges = (events, transaction) => {
      const origin = transaction.origin
      if (origin !== resolvedBinding) {
        const isFromUndoManger = origin instanceof UndoManager
        syncYjsChangesToLexical(
          resolvedBinding,
          resolvedProvider,
          events,
          isFromUndoManger,
          toValue(syncCursorPositionsFn) ?? syncCursorPositions,
        )
      }
    }

    root.getSharedType().observeDeep(onYjsTreeChanges)
    const removeListener = editor.registerUpdateListener(
      ({ prevEditorState, editorState, dirtyLeaves, dirtyElements, normalizedNodes, tags }) => {
        if (!tags.has(SKIP_COLLAB_TAG)) {
          syncLexicalUpdateToYjs(
            resolvedBinding,
            resolvedProvider,
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
    const resolvedBinding = toValue(binding)
    const resolvedProvider = provider.value
    if (!resolvedProvider || !resolvedBinding) {
      return
    }

    const onProviderDocReload = (ydoc: Doc) => {
      clearEditorSkipCollab(editor, resolvedBinding)
      doc.value = ydoc
      toValue(docMap).set(toValue(id), ydoc)
      isReloadingDoc.value = true
    }

    const onSync = () => {
      isReloadingDoc.value = false
    }

    resolvedProvider.on('reload', onProviderDocReload)
    resolvedProvider.on('sync', onSync)

    onInvalidate(() => {
      resolvedProvider.off('reload', onProviderDocReload)
      resolvedProvider.off('sync', onSync)
    })
  })

  useProvider(editor, provider, name, color, isReloadingDoc, awarenessData, onBootstrap)

  useAwareness(binding, provider, selectionHighlight)

  return useYjsCursors(binding, cursorsContainerRef)
}

function useAwareness(
  binding: MaybeRefOrGetter<Binding>,
  provider: Ref<Provider>,
  selectionHighlight?: MaybeRefOrGetter<boolean | undefined>,
) {
  watchEffect((onInvalidate) => {
    const resolvedBinding = toValue(binding)
    const resolvedProvider = provider.value
    if (!resolvedBinding || !resolvedProvider) {
      return
    }

    const onAwarenessUpdate = () => {
      syncCursorPositions(resolvedBinding, resolvedProvider, {
        selectionHighlight: toValue(selectionHighlight) ?? false,
      })
    }

    resolvedProvider.awareness.on('update', onAwarenessUpdate)
    onInvalidate(() => {
      resolvedProvider.awareness.off('update', onAwarenessUpdate)
    })
  })
}

export function useProvider(
  editor: LexicalEditor,
  provider: Ref<Provider>,
  name: MaybeRefOrGetter<string>,
  color: MaybeRefOrGetter<string>,
  isReloadingDoc: Ref<boolean>,
  awarenessData?: MaybeRefOrGetter<object | undefined>,
  onBootstrap?: () => void,
): void {
  const disconnect = (resolvedProvider: Provider) => {
    try {
      resolvedProvider.disconnect()
    } catch {
      // Do nothing
    }
  }

  watchEffect((onInvalidate) => {
    const resolvedProvider = provider.value
    if (!resolvedProvider) {
      return
    }

    const onStatus = ({ status }: { status: string }) => {
      editor.dispatchCommand(CONNECTED_COMMAND, status === 'connected')
    }

    const onSync = (isSynced: boolean) => {
      if (isSynced && isReloadingDoc.value === false && onBootstrap) {
        onBootstrap()
      }
    }

    const rootElement = editor.getRootElement()
    initLocalState(
      resolvedProvider,
      toValue(name),
      toValue(color),
      rootElement !== null && getActiveElement(rootElement) === rootElement,
      toValue(awarenessData) || {},
    )

    resolvedProvider.on('status', onStatus)
    resolvedProvider.on('sync', onSync)

    const connectionPromise = resolvedProvider.connect()

    onInvalidate(() => {
      if (isReloadingDoc.value === false) {
        if (connectionPromise) {
          connectionPromise.then(() => disconnect(resolvedProvider))
        } else {
          // Workaround for race condition in StrictMode. It's possible there
          // is a different race for the above case where connect returns a
          // promise, but we don't have an example of that in-repo.
          // It's possible that there is a similar issue with
          // TOGGLE_CONNECT_COMMAND below when the provider connect returns a
          // promise.
          // https://github.com/facebook/lexical/issues/6640
          disconnect(resolvedProvider)
        }
      }

      resolvedProvider.off('sync', onSync)
      resolvedProvider.off('status', onStatus)
    })
  })

  watchEffect((onInvalidate) => {
    const resolvedProvider = provider.value
    if (!resolvedProvider) {
      return
    }

    const unregister = editor.registerCommand(
      TOGGLE_CONNECT_COMMAND,
      (payload) => {
        const shouldConnect = payload

        if (shouldConnect) {
          // oxlint-disable-next-line no-console
          console.log('Collaboration connected!')
          resolvedProvider.connect()
        } else {
          // oxlint-disable-next-line no-console
          console.log('Collaboration disconnected!')
          disconnect(resolvedProvider)
        }

        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )

    onInvalidate(unregister)
  })

  watchEffect((onInvalidate) => {
    const resolvedProvider = provider.value
    if (!resolvedProvider) {
      return
    }

    const clearAwarenessState = () => {
      try {
        resolvedProvider.awareness.setLocalState(null)
      } catch {
        // Ignore errors during cleanup if the provider is already disconnected.
      }
    }

    onInvalidate(
      registerEventListeners(window, {
        beforeunload: clearAwarenessState,
        pagehide: clearAwarenessState,
      }),
    )
  })
}

export function useYjsCursors(
  binding: MaybeRefOrGetter<BaseBinding>,
  cursorsContainerRef?: MaybeRefOrGetter<HTMLElement | null>,
) {
  return computed(() => {
    const resolvedBinding = toValue(binding)
    if (!resolvedBinding) {
      return null
    }

    const target = toValue(cursorsContainerRef) || document.body

    return h(
      Teleport,
      { to: target },
      h('div', {
        ref: (element) => {
          resolvedBinding.cursorsContainer = element as null | HTMLElement
        },
      }),
    )
  })
}

export function useYjsFocusTracking(
  editor: LexicalEditor,
  provider: Ref<Provider>,
  name: MaybeRefOrGetter<string>,
  color: MaybeRefOrGetter<string>,
  awarenessData?: MaybeRefOrGetter<object | undefined>,
) {
  watchEffect((onInvalidate) => {
    const resolvedProvider = provider.value
    if (!resolvedProvider) {
      return
    }

    const unregister = mergeRegister(
      editor.registerCommand(
        FOCUS_COMMAND,
        () => {
          setLocalStateFocus(
            resolvedProvider,
            toValue(name),
            toValue(color),
            true,
            toValue(awarenessData) || {},
          )
          return false
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        BLUR_COMMAND,
        () => {
          setLocalStateFocus(
            resolvedProvider,
            toValue(name),
            toValue(color),
            false,
            toValue(awarenessData) || {},
          )
          return false
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    )

    onInvalidate(unregister)
  })
}

export function useYjsHistory(
  editor: LexicalEditor,
  binding: MaybeRefOrGetter<Binding>,
): () => void {
  const undoManager = computed(() => {
    const resolvedBinding = toValue(binding)
    return resolvedBinding
      ? createUndoManager(resolvedBinding, resolvedBinding.root.getSharedType())
      : null
  })

  return useYjsUndoManager(editor, undoManager)
}

export function useYjsUndoManager(editor: LexicalEditor, undoManager: Ref<UndoManager | null>) {
  watchEffect((onInvalidate) => {
    const resolvedUndoManager = undoManager.value
    if (!resolvedUndoManager) {
      return
    }

    const undo = () => {
      resolvedUndoManager.undo()
    }

    const redo = () => {
      resolvedUndoManager.redo()
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

  watchEffect((onInvalidate) => {
    const resolvedUndoManager = undoManager.value
    if (!resolvedUndoManager) {
      return
    }
    const editorWithManager = editor as LexicalEditor & Record<symbol, UndoManager | undefined>
    editorWithManager[COLLAB_UNDO_MANAGER] = resolvedUndoManager
    onInvalidate(() => {
      if (editorWithManager[COLLAB_UNDO_MANAGER] === resolvedUndoManager) {
        delete editorWithManager[COLLAB_UNDO_MANAGER]
      }
    })
  })

  const clearHistory = () => {
    undoManager.value?.clear()
  }

  // Exposing undo and redo states
  watchEffect((onInvalidate) => {
    const resolvedUndoManager = undoManager.value
    if (!resolvedUndoManager) {
      return
    }

    const updateUndoRedoStates = () => {
      editor.dispatchCommand(CAN_UNDO_COMMAND, resolvedUndoManager.undoStack.length > 0)
      editor.dispatchCommand(CAN_REDO_COMMAND, resolvedUndoManager.redoStack.length > 0)
    }
    resolvedUndoManager.on('stack-item-added', updateUndoRedoStates)
    resolvedUndoManager.on('stack-item-popped', updateUndoRedoStates)
    resolvedUndoManager.on('stack-cleared', updateUndoRedoStates)
    onInvalidate(() => {
      resolvedUndoManager.off('stack-item-added', updateUndoRedoStates)
      resolvedUndoManager.off('stack-item-popped', updateUndoRedoStates)
      resolvedUndoManager.off('stack-cleared', updateUndoRedoStates)
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
                  if (root1.isEmpty()) initialEditorState(editor)
                },
                { tag: HISTORY_MERGE_TAG },
              )
              break
            }
          }
        } else {
          const paragraph = $createParagraphNode()
          root.append(paragraph)
          const rootElement = editor.getRootElement()

          if (
            $getSelection() !== null ||
            (rootElement !== null && getActiveElement(rootElement) === rootElement)
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

function clearEditorSkipCollab(editor: LexicalEditor, binding: BaseBinding) {
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

  if (binding.cursors == null) return

  const cursors = binding.cursors

  if (cursors == null) return

  const cursorsContainer = binding.cursorsContainer

  if (cursorsContainer == null) return

  for (const cursor of cursors.values()) {
    const selection = cursor.selection
    if (selection === null) {
      continue
    }
    if (selection.highlight !== null) {
      ;(CSS.highlights as unknown as { delete: (name: string) => boolean }).delete(
        selection.highlightName,
      )
      removeCursorHighlightRule(binding, selection.highlightName)
    }
    if (selection.caret.parentNode === cursorsContainer) {
      cursorsContainer.removeChild(selection.caret)
    }
    for (const span of selection.selections) {
      if (span.parentNode === cursorsContainer) {
        cursorsContainer.removeChild(span)
      }
    }
    cursor.selection = null
  }
}
