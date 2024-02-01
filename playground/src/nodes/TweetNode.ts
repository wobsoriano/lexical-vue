/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  Spread,
} from 'lexical'

import type {
  SerializedDecoratorBlockNode,
} from 'lexical-vue'
import { DecoratorBlockNode, LexicalBlockWithAlignableContents } from 'lexical-vue'
import type { Component } from 'vue'
import { defineComponent, h, ref, watchEffect } from 'vue'

const WIDGET_SCRIPT_URL = 'https://platform.twitter.com/widgets.js'

let isTwitterScriptLoading = true

const TweetComponent = defineComponent({
  emits: ['load', 'error'],
  props: ['tweetID', 'format', 'nodeKey', 'baseClass', 'hoverClass'],
  setup(props, { emit }) {
    const containerRef = ref<HTMLDivElement | null>(null)

    const previousTweetIDRef = ref<string>('')
    const isTweetLoading = ref(false)

    const createTweet = async () => {
      try {
        // @ts-expect-error Twitter is attached to the window.
        await window.twttr.widgets.createTweet(props.tweetID, containerRef.value)

        isTweetLoading.value = false
        isTwitterScriptLoading = false

        emit('load')
      }
      catch (error) {
        emit('error', String(error))
      }
    }

    watchEffect(() => {
      if (props.tweetID !== previousTweetIDRef.value) {
        isTweetLoading.value = true

        if (isTwitterScriptLoading) {
          const script = document.createElement('script')
          script.src = WIDGET_SCRIPT_URL
          script.async = true
          document.body?.appendChild(script)
          script.onload = createTweet
        }
        else {
          createTweet()
        }

        if (previousTweetIDRef)
          previousTweetIDRef.value = props.tweetID
      }
    })

    return () => h(LexicalBlockWithAlignableContents, {
      hoverClass: props.hoverClass,
      format: props.format,
      nodeKey: props.nodeKey,
    }, () => [
      isTweetLoading.value && h('div', 'Loading...'),
      h('div', {
        style: { display: 'inline-block', width: '550px' },
        ref: containerRef,
      }),
    ])
  },
})

function convertTweetElement(
  domNode: HTMLDivElement,
): DOMConversionOutput | null {
  const id = domNode.getAttribute('data-lexical-tweet-id')
  if (id) {
    const node = $createTweetNode(id)
    return { node }
  }
  return null
}

export type SerializedTweetNode = Spread<
  {
    id: string
  },
  SerializedDecoratorBlockNode
>

export class TweetNode extends DecoratorBlockNode {
  __id: string

  static getType(): string {
    return 'tweet'
  }

  static clone(node: TweetNode): TweetNode {
    return new TweetNode(node.__id, node.__format, node.__key)
  }

  static importJSON(serializedNode: SerializedTweetNode): TweetNode {
    const node = $createTweetNode(serializedNode.id)
    node.setFormat(serializedNode.format)
    return node
  }

  exportJSON(): SerializedTweetNode {
    return {
      ...super.exportJSON(),
      id: this.getId(),
      type: 'tweet',
      version: 1,
    }
  }

  static importDOM(): DOMConversionMap<HTMLDivElement> | null {
    return {
      div: (domNode: HTMLDivElement) => {
        if (!domNode.hasAttribute('data-lexical-tweet-id'))
          return null

        return {
          conversion: convertTweetElement,
          priority: 2,
        }
      },
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.setAttribute('data-lexical-tweet-id', this.__id)
    const text = document.createTextNode(this.getTextContent())
    element.append(text)
    return { element }
  }

  constructor(id: string, format?: ElementFormatType, key?: NodeKey) {
    super(format, key)
    this.__id = id
  }

  getId(): string {
    return this.__id
  }

  getTextContent(
    _includeInert?: boolean | undefined,
    _includeDirectionless?: false | undefined,
  ): string {
    return `https://x.com/i/web/status/${this.__id}`
  }

  decorate(editor: LexicalEditor, config: EditorConfig): Component {
    const embedBlockTheme = config.theme.embedBlock || {}
    return h(TweetComponent, {
      baseClass: embedBlockTheme.base || '',
      hoverClass: embedBlockTheme.focus || '',
      format: this.__format,
      nodeKey: this.getKey(),
      tweetID: this.__id,
    })
  }
}

export function $createTweetNode(tweetID: string): TweetNode {
  return new TweetNode(tweetID)
}

export function $isTweetNode(
  node: TweetNode | LexicalNode | null | undefined,
): node is TweetNode {
  return node instanceof TweetNode
}
