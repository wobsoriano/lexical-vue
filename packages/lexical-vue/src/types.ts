import type { EditorState, LexicalEditor } from 'lexical'

import type { Events, HTMLAttributes as VueHTMLAttributes } from 'vue'

export type InitialEditorStateType
  = | null
    | string
    | EditorState
    | ((editor: LexicalEditor) => void)

// Utility type to convert kebab-case to camelCase
type KebabToCamelCase<S extends string> = S extends `${infer P1}-${infer P2}`
  ? `${P1}${Capitalize<KebabToCamelCase<P2>>}`
  : S

// Utility type to convert all keys in an object from kebab-case to camelCase
type CamelCaseKeys<T> = {
  [K in keyof T as KebabToCamelCase<K & string>]: T[K]
}

export type HTMLAttributes = Omit<
  CamelCaseKeys<Omit<VueHTMLAttributes, keyof Events>>,
  `aria-${string}`
>

// Utility function to convert camelCase to kebab-case
export function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

// Utility function to convert object with camelCase keys to kebab-case keys
export function convertCamelToKebab<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('aria') && key !== key.toLowerCase()) {
      result[camelToKebab(key)] = value
    }
    else {
      result[key] = value
    }
  }
  return result
}
