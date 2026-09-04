import type { LexicalEditor } from 'lexical'
import type { InjectionKey } from 'vue'

export const lexicalEditorKey = Symbol('LexicalEditor') as InjectionKey<LexicalEditor>
