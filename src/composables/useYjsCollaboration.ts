import type { Binding, ExcludedProperties, Provider } from '@lexical/yjs'
import type { LexicalEditor } from 'lexical'

import { mergeRegister } from '@lexical/utils'
import {
  CONNECTED_COMMAND,
  TOGGLE_CONNECT_COMMAND,
  createBinding,
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
  COMMAND_PRIORITY_EDITOR,
  FOCUS_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical'
import type { Doc, Transaction, YEvent } from 'yjs'
import { UndoManager } from 'yjs'
import type { ComputedRef } from 'vue'
import { computed, ref, toRaw } from 'vue'
import type { InitialEditorStateType } from '../types'
import { useEffect } from './useEffect'

export function useYjsCollaboration(
  editor: LexicalEditor,
  id: string,
  provider: Provider,
  docMap: Map<string, Doc>,
  name: string,
  color: string,
  shouldBootstrap: boolean,
  initialEditorState?: InitialEditorStateType,
  excludedProperties?: ExcludedProperties,
  awarenessData?: object,
): ComputedRef<Binding> {
  const isReloadingDoc = ref(false)
  const doc = ref(docMap.get(id))

  const binding = computed(() => createBinding(editor, provider, id, toRaw(doc.value), docMap, excludedProperties))

  const connect = () => {
    provider.connect()
  }

  const disconnect = () => {
    try {
      provider.disconnect()
    }
    catch {
      // Do nothing
    }
  }

  useEffect(() => {
    const { root } = binding.value
    const { awareness } = provider

    const onStatus = ({ status }: { status: string }) => {
      editor.dispatchCommand(CONNECTED_COMMAND, status === 'connected')
    }

    const onSync = (isSynced: boolean) => {
      if (
        shouldBootstrap
        && isSynced
        && root.isEmpty()
        && root._xmlText._length === 0
        && isReloadingDoc.value === false
      ) {
        initializeEditor(editor, initialEditorState)
      }

      isReloadingDoc.value = false
    }

    const onAwarenessUpdate = () => {
      syncCursorPositions(binding.value, provider)
    }

    const onYjsTreeChanges = (
      // The below `any` type is taken directly from the vendor types for YJS.
      events: Array<YEvent<any>>,
      transaction: Transaction,
    ) => {
      const origin = transaction.origin
      if (toRaw(origin) !== binding.value) {
        const isFromUndoManger = origin instanceof UndoManager
        syncYjsChangesToLexical(binding.value, provider, events, isFromUndoManger)
      }
    }

    initLocalState(
      provider,
      name,
      color,
      document.activeElement === editor.getRootElement(),
      awarenessData || {},
    )

    const onProviderDocReload = (ydoc: Doc) => {
      clearEditorSkipCollab(editor, binding.value)
      doc.value = ydoc
      docMap.set(id, ydoc)
      isReloadingDoc.value = true
    }

    provider.on('reload', onProviderDocReload)
    provider.on('status', onStatus)
    provider.on('sync', onSync)
    awareness.on('update', onAwarenessUpdate)
    // This updates the local editor state when we recieve updates from other clients
    root.getSharedType().observeDeep(onYjsTreeChanges)
    const removeListener = editor.registerUpdateListener(
      ({ prevEditorState, editorState, dirtyLeaves, dirtyElements, normalizedNodes, tags }) => {
        if (tags.has('skip-collab') === false) {
          syncLexicalUpdateToYjs(
            binding.value,
            provider,
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
    connect()

    return () => {
      if (isReloadingDoc.value === false)
        disconnect()

      provider.off('sync', onSync)
      provider.off('status', onStatus)
      provider.off('reload', onProviderDocReload)
      awareness.off('update', onAwarenessUpdate)
      root.getSharedType().unobserveDeep(onYjsTreeChanges)
      docMap.delete(id)
      removeListener()
    }
  })

  useEffect(() => {
    return editor.registerCommand(
      TOGGLE_CONNECT_COMMAND,
      (payload) => {
        if (connect !== undefined && disconnect !== undefined) {
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
        }

        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  })

  return binding
}

export function useYjsFocusTracking(
  editor: LexicalEditor,
  provider: Provider,
  name: string,
  color: string,
  awarenessData?: object,
) {
  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        FOCUS_COMMAND,
        () => {
          setLocalStateFocus(provider, name, color, true, awarenessData || {})
          return false
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        BLUR_COMMAND,
        () => {
          setLocalStateFocus(provider, name, color, false, awarenessData || {})
          return false
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    )
  })
}

export function useYjsHistory(editor: LexicalEditor, binding: Binding): () => void {
  const undoManager = computed(() => createUndoManager(binding, binding.root.getSharedType()))

  useEffect(() => {
    const undo = () => {
      undoManager.value.undo()
    }

    const redo = () => {
      undoManager.value.redo()
    }

    return mergeRegister(
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
  })
  const clearHistory = () => {
    undoManager.value.clear()
  }
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
              editor.setEditorState(parsedEditorState, { tag: 'history-merge' })
              break
            }
            case 'object': {
              editor.setEditorState(initialEditorState, { tag: 'history-merge' })
              break
            }
            case 'function': {
              editor.update(
                () => {
                  const root1 = $getRoot()
                  if (root1.isEmpty())
                    initialEditorState(editor)
                },
                { tag: 'history-merge' },
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
      tag: 'history-merge',
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
      tag: 'skip-collab',
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
