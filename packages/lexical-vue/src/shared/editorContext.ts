import type { LexicalEditor } from 'lexical'
import type { InjectionKey } from 'vue'

export const lexicalEditorKey = Symbol('LexicalEditor') as InjectionKey<LexicalEditor>

/**
 * The editor whose decorator nodes an ancestor already teleports. A component
 * that hosts decorators claims this for its subtree, and any descendant host
 * for the same editor renders nothing.
 */
export const decoratorHostKey = Symbol('LexicalDecoratorHost') as InjectionKey<LexicalEditor>
