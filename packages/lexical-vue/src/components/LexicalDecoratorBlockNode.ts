import type { ElementFormatType, LexicalNode } from 'lexical'

import { DecoratorNode } from 'lexical'
import type { Component } from 'vue'

export class DecoratorBlockNode extends DecoratorNode<Component> {
  __format?: ElementFormatType

  createDOM() {
    return document.createElement('div')
  }

  updateDOM() {
    return false
  }

  setFormat(format: ElementFormatType) {
    const self = this.getWritable()
    self.__format = format
  }
}

export function $createDecoratorBlockNode() {
  return new DecoratorBlockNode()
}

export function $isDecoratorBlockNode(node?: LexicalNode) {
  return node instanceof DecoratorBlockNode
}
