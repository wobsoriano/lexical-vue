import type { InjectionKey } from 'vue'
import type { LexicalEditor } from 'lexical'

export const editorKey: InjectionKey<LexicalEditor> = Symbol('Lexical editor')
