import type { Ref } from 'vue'
import { isRef } from 'vue'

export function getRealValue<T>(item: Ref<T> | T) {
  return isRef(item) ? item.value : item
}

// TODO: Not available in lexical 0.2.1 yet
// https://github.com/facebook/lexical/blob/main/packages/lexical/src/LexicalEditor.js
export const COMMAND_PRIORITY_EDITOR = 0
export const COMMAND_PRIORITY_LOW = 1
export const COMMAND_PRIORITY_NORMAL = 2
export const COMMAND_PRIORITY_HIGH = 3
export const COMMAND_PRIORITY_CRITICAL = 4
