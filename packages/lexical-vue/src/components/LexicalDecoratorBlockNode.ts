import type { ElementFormatType, LexicalNode } from 'lexical'

import { DecoratorNode } from 'lexical'
import type { Component } from 'vue'

export class DecoratorBlockNode extends DecoratorNode<Component> {
  __format?: ElementFormatType

  createDOM(): HTMLElement {
    return document.createElement('div')
  }

  updateDOM(): false {
    return false
  }

  setFormat(format: ElementFormatType): void {
    const self = this.getWritable()
    // @ts-expect-error: Internal types
    self.__format = format
  }
}

export function $createDecoratorBlockNode(): DecoratorBlockNode {
  return new DecoratorBlockNode()
}

export function $isDecoratorBlockNode(node?: LexicalNode) {
  return node instanceof DecoratorBlockNode
}
