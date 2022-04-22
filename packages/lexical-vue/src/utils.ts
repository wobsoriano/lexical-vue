import type { Ref } from 'vue'
import { isRef } from 'vue'

export function getRealValue<T>(item: Ref<T> | T) {
  return isRef(item) ? item.value : item
}

/**
 * Taken from https://github.com/piotrwitek/utility-types/blob/master/src/utility-types.ts#L158
 */
export type Class<T> = new (...args: any[]) => T
