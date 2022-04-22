import type { Ref } from 'vue'
import { isRef } from 'vue'

export function getRealValue<T>(item: Ref<T> | T) {
  return isRef(item) ? item.value : item
}

export type Class<T> = new (...args: any[]) => T
