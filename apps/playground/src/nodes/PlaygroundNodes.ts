import type { Klass, LexicalNode } from 'lexical'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { HashtagNode } from '@lexical/hashtag'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { EmojiNode } from './EmojiNode'
import { MentionNode } from './MentionNode'
import { TweetNode } from './TweetNode'
import { YouTubeNode } from './YouTubeNode'

const PlaygroundNodes: Array<Klass<LexicalNode>> = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  CodeHighlightNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  AutoLinkNode,
  LinkNode,
  HashtagNode,
  EmojiNode,
  MentionNode,
  YouTubeNode,
  TweetNode,
]

export default PlaygroundNodes
