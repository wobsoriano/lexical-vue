import type { Klass, LexicalNode } from 'lexical'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { EmojiNode } from './EmojiNode'
import { TweetNode } from './TweetNode'
import { YouTubeNode } from './YouTubeNode'

const PlaygroundNodes: Array<Klass<LexicalNode>> = [
  AutoLinkNode,
  LinkNode,
  YouTubeNode,
  TweetNode,
  EmojiNode,
]

export default PlaygroundNodes
