import type { Klass, LexicalNode } from 'lexical'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { YouTubeNode } from './YouTubeNode'

const PlaygroundNodes: Array<Klass<LexicalNode>> = [
  AutoLinkNode,
  LinkNode,
  YouTubeNode,
]

export default PlaygroundNodes
