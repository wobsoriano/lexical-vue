let handleClickAndPointerDownListenersCount = 0

export function incrementCheckListListenersCount() {
  return handleClickAndPointerDownListenersCount++ === 0
}

export function decrementCheckListListenersCount() {
  return --handleClickAndPointerDownListenersCount === 0
}
