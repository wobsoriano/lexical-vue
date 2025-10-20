import type { EditorState, LexicalEditor } from 'lexical'
import type { AriaAttributes, StyleValue } from 'vue'

export type InitialEditorStateType =
  | null
  | string
  | EditorState
  | ((editor: LexicalEditor) => void)

type Booleanish = boolean | 'true' | 'false'
type Numberish = number | string

export interface HTMLAttributes extends AriaAttributes {
  innerHTML?: string
  class?: any
  style?: StyleValue
  accesskey?: string
  contenteditable?: Booleanish | 'inherit' | 'plaintext-only'
  contextmenu?: string
  dir?: string
  draggable?: Booleanish
  hidden?: Booleanish | '' | 'hidden' | 'until-found'
  id?: string
  inert?: Booleanish
  lang?: string
  placeholder?: string
  spellcheck?: Booleanish
  tabindex?: Numberish
  title?: string
  translate?: 'yes' | 'no'
  radiogroup?: string
  role?: string
  about?: string
  datatype?: string
  inlist?: any
  property?: string
  resource?: string
  typeof?: string
  vocab?: string
  autocapitalize?: string
  autocorrect?: string
  autosave?: string
  color?: string
  itemprop?: string
  itemscope?: Booleanish
  itemtype?: string
  itemid?: string
  itemref?: string
  results?: Numberish
  security?: string
  unselectable?: 'on' | 'off'
  /**
   * Hints at the type of data that might be entered by the user while editing the element or its contents
   * @see https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
   */
  inputmode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
  /**
   * Specify that a standard HTML element should behave like a defined custom built-in element
   * @see https://html.spec.whatwg.org/multipage/custom-elements.html#attr-is
   */
  is?: string
}
