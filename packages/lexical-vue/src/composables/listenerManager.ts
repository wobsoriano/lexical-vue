let handleClickAndPointerDownListenersCount = 0
let handleClickAndPointerDownListenersUnregister: (() => void) | undefined

export function registerClickAndPointerListeners(register: () => void, unregister: () => void) {
  if (handleClickAndPointerDownListenersCount++ === 0) {
    register()
    handleClickAndPointerDownListenersUnregister = unregister
  }

  return () => {
    if (--handleClickAndPointerDownListenersCount === 0) {
      handleClickAndPointerDownListenersUnregister?.()
      handleClickAndPointerDownListenersUnregister = undefined
    }
  }
}
