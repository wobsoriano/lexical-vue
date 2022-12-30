import type { ElementFormatType, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical'

import { DecoratorNode } from 'lexical'
import type { Component } from 'vue'

export type SerializedDecoratorBlockNode = Spread<
  {
    format: ElementFormatType
  },
  SerializedLexicalNode
>

export class DecoratorBlockNode extends DecoratorNode<Component> {
  __format?: ElementFormatType

  constructor(format?: ElementFormatType, key?: NodeKey) {
    super(key)
    this.__format = format || ''
  }

  exportJSON(): SerializedDecoratorBlockNode {
    return {
      format: this.__format || '',
      type: 'decorator-block',
      version: 1,
    }
  }

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

export function $isDecoratorBlockNode(node: LexicalNode | null | undefined): node is DecoratorBlockNode {
  return node instanceof DecoratorBlockNode
}
