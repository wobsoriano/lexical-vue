import type { LexicalEditor } from 'lexical'
import type { InjectionKey } from 'vue'

export const lexicalEditorKey = Symbol('LexicalEditor') as InjectionKey<LexicalEditor>

/** The editor whose decorator nodes an ancestor already teleports. */
export const decoratorHostKey = Symbol('LexicalDecoratorHost') as InjectionKey<LexicalEditor>
