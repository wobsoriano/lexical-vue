import type {
  ElementFormatType,
  LexicalNode,
  LexicalUpdateJSON,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'

import { DecoratorNode } from 'lexical'
import type { Component } from 'vue'

export type SerializedDecoratorBlockNode = Spread<
  {
    format: ElementFormatType
  },
  SerializedLexicalNode
>

export class DecoratorBlockNode extends DecoratorNode<Component> {
  __format: ElementFormatType

  constructor(format?: ElementFormatType, key?: NodeKey) {
    super(key)
    this.__format = format || ''
  }

  canIndent(): false {
    return false
  }

  isInline(): false {
    return false
  }

  exportJSON(): SerializedDecoratorBlockNode {
    return {
      ...super.exportJSON(),
      format: this.__format || '',
    }
  }

  updateFromJSON(
    serializedNode: LexicalUpdateJSON<SerializedDecoratorBlockNode>,
  ): this {
    return super
      .updateFromJSON(serializedNode)
      .setFormat(serializedNode.format || '')
  }

  setFormat(format: ElementFormatType): this {
    const self = this.getWritable()
    self.__format = format
    return self
  }

  createDOM() {
    return document.createElement('div')
  }

  updateDOM() {
    return false
  }
}

export function $createDecoratorBlockNode() {
  return new DecoratorBlockNode()
}

export function $isDecoratorBlockNode(node: LexicalNode | null | undefined): node is DecoratorBlockNode {
  return node instanceof DecoratorBlockNode
}
