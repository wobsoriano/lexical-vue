let handleClickAndPointerDownListenersRegistered = false

export function registerClickAndPointerListenersIfUnregistered(register: () => void, unregister: () => void) {
  if (handleClickAndPointerDownListenersRegistered)
    return () => {}

  handleClickAndPointerDownListenersRegistered = true
  register()
  return unregister
}
