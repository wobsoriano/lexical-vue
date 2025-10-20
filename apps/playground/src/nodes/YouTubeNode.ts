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
import {
  DecoratorBlockNode,
  LexicalBlockWithAlignableContents,
} from 'lexical-vue'
import type { Component } from 'vue'
import { defineComponent, h } from 'vue'

const YouTubeComponent = defineComponent({
  name: 'YouTubeComponent',
  props: ['format', 'nodeKey', 'videoID'],
  setup(props) {
    return () => h(LexicalBlockWithAlignableContents, {
      format: props.format,
      nodeKey: props.nodeKey,
    }, () => h('iframe', {
      width: '560',
      height: '315',
      src: `https://www.youtube-nocookie.com/embed/${props.videoID}`,
      frameBorder: '0',
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
      allowFullScreen: true,
      title: 'YouTube video',
    }))
  },
})

export type SerializedYouTubeNode = Spread<
  {
    videoID: string
  },
  SerializedDecoratorBlockNode
>

function convertYoutubeElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  const videoID = domNode.getAttribute('data-lexical-youtube')
  if (videoID) {
    const node = $createYouTubeNode(videoID)
    return { node }
  }
  return null
}

export class YouTubeNode extends DecoratorBlockNode {
  __id: string

  static getType(): string {
    return 'youtube'
  }

  static clone(node: YouTubeNode): YouTubeNode {
    return new YouTubeNode(node.__id, node.__format, node.__key)
  }

  static importJSON(serializedNode: SerializedYouTubeNode): YouTubeNode {
    const node = $createYouTubeNode(serializedNode.videoID)
    node.setFormat(serializedNode.format)
    return node
  }

  exportJSON(): SerializedYouTubeNode {
    return {
      ...super.exportJSON(),
      type: 'youtube',
      version: 1,
      videoID: this.__id,
    }
  }

  constructor(id: string, format?: ElementFormatType, key?: NodeKey) {
    super(format, key)
    this.__id = id
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('iframe')
    element.setAttribute('data-lexical-youtube', this.__id)
    element.setAttribute('width', '560')
    element.setAttribute('height', '315')
    element.setAttribute(
      'src',
      `https://www.youtube-nocookie.com/embed/${this.__id}`,
    )
    element.setAttribute('frameborder', '0')
    element.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
    )
    element.setAttribute('allowfullscreen', 'true')
    element.setAttribute('title', 'YouTube video')
    return { element }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      iframe: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-youtube'))
          return null

        return {
          conversion: convertYoutubeElement,
          priority: 1,
        }
      },
    }
  }

  updateDOM(): false {
    return false
  }

  getId(): string {
    return this.__id
  }

  getTextContent(
    _includeInert?: boolean | undefined,
    _includeDirectionless?: false | undefined,
  ): string {
    return `https://www.youtube.com/watch?v=${this.__id}`
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): Component {
    const embedBlockTheme = config.theme.embedBlock || {}
    return h(YouTubeComponent, {
      baseClass: embedBlockTheme.base || '',
      focusClass: embedBlockTheme.focus || '',
      format: this.__format,
      nodeKey: this.getKey(),
      videoID: this.__id,
    })
  }
}

export function $createYouTubeNode(videoID: string): YouTubeNode {
  return new YouTubeNode(videoID)
}

export function $isYouTubeNode(
  node: YouTubeNode | LexicalNode | null | undefined,
): node is YouTubeNode {
  return node instanceof YouTubeNode
}
