<script setup lang="ts">
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical'
import {
  LexicalAutoFocusPlugin,
  LexicalComposer,
  LexicalContentEditable,
  LexicalHashtagPlugin,
  LexicalHistoryPlugin,
  LexicalLinkPlugin,
  LexicalListPlugin,
  LexicalRichTextPlugin,
} from 'lexical-vue'
import { $createHeadingNode, $createQuoteNode, HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { $createListItemNode, $createListNode, ListItemNode, ListNode } from '@lexical/list'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { $createLinkNode, AutoLinkNode, LinkNode } from '@lexical/link'
import { HashtagNode } from '@lexical/hashtag'

import exampleTheme from '../themes/example'
import ToolbarPlugin from './ToolbarPlugin.vue'
import CodeHighlightPlugin from './CodeHighlightPlugin.vue'
import ListMaxIndentLevelPlugin from './ListMaxIndentLevelPlugin.vue'
import AutoLinkPlugin from './AutoLinkPlugin.vue'
import TreeViewPlugin from './TreeViewPlugin.vue'
import MarkdownShortcutPlugin from './MarkdownShortcutPlugin.vue'
import EmojisPlugin from './EmojisPlugin.vue'
import { EmojiNode } from './EmojiNode'

function prePopulatedRichText() {
  const root = $getRoot()
  if (root.getFirstChild() === null) {
    const heading = $createHeadingNode('h1')
    heading.append($createTextNode('Welcome to the playground'))
    root.append(heading)
    const quote = $createQuoteNode()
    quote.append(
      $createTextNode(
        'In case you were wondering what the black box at the bottom is – it\'s the debug view, showing the current state of editor. '
          + 'You can disable it by pressing on the settings control in the bottom-left of your screen and toggling the debug view setting.',
      ),
    )
    root.append(quote)
    const paragraph = $createParagraphNode()
    paragraph.append(
      $createTextNode('The playground is a demo environment built with '),
      $createTextNode('lexical').toggleFormat('code'),
      $createTextNode(' and '),
      $createTextNode('lexical-vue').toggleFormat('code'),
      $createTextNode('.'),
      $createTextNode(' Try typing in '),
      $createTextNode('some text').toggleFormat('bold'),
      $createTextNode(' with '),
      $createTextNode('different').toggleFormat('italic'),
      $createTextNode(' formats.'),
    )
    root.append(paragraph)
    const paragraph2 = $createParagraphNode()
    paragraph2.append(
      $createTextNode(
        'Make sure to check out the various plugins in the toolbar. You can also use #hashtags or @-mentions too!',
      ),
    )
    root.append(paragraph2)
    const paragraph3 = $createParagraphNode()
    paragraph3.append(
      $createTextNode('If you\'d like to find out more about Lexical, you can:'),
    )
    root.append(paragraph3)
    const list = $createListNode('bullet')
    list.append(
      $createListItemNode().append(
        $createTextNode('Visit the '),
        $createLinkNode('https://lexical.dev/').append(
          $createTextNode('Lexical website'),
        ),
        $createTextNode(' for documentation and more information.'),
      ),
      $createListItemNode().append(
        $createTextNode('Check out the code on the '),
        $createLinkNode('https://github.com/wobsoriano/lexical-vue').append(
          $createTextNode('lexical-vue GitHub repository'),
        ),
        $createTextNode('.'),
      ),
      $createListItemNode().append(
        $createTextNode('Playground code can be found '),
        $createLinkNode(
          'https://github.com/wobsoriano/lexical-vue/tree/main/playground',
        ).append($createTextNode('here')),
        $createTextNode('.'),
      ),
      $createListItemNode().append(
        $createTextNode('Join the '),
        $createLinkNode('https://discord.com/invite/KmG4wQnnD9').append(
          $createTextNode('Lexical Discord Server'),
        ),
        $createTextNode(' and chat with the team.'),
      ),
    )
    root.append(list)
    const paragraph4 = $createParagraphNode()
    paragraph4.append(
      $createTextNode(
        'Lastly, we\'re constantly adding cool new features to this playground. So make sure you check back here when you next get a chance :).',
      ),
    )
    root.append(paragraph4)
  }
}

const config = {
  theme: exampleTheme,
  nodes: [
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
  ],
  editable: true,
  editorState: prePopulatedRichText,
}

function onError(error: Error) {
  throw error
}
</script>

<template>
  <LexicalComposer :initial-config="config" @error="onError">
    <div class="editor-container">
      <ToolbarPlugin />
      <div className="editor-inner">
        <LexicalRichTextPlugin>
          <template #contentEditable>
            <LexicalContentEditable class="editor-input" />
          </template>
          <template #placeholder>
            <div class="editor-placeholder">
              Enter some text...
            </div>
          </template>
        </LexicalRichTextPlugin>
        <LexicalHistoryPlugin />
        <TreeViewPlugin />
        <LexicalAutoFocusPlugin />
        <CodeHighlightPlugin />
        <LexicalListPlugin />
        <LexicalLinkPlugin />
        <AutoLinkPlugin />
        <ListMaxIndentLevelPlugin :max-depth="7" />
        <LexicalHashtagPlugin />
        <MarkdownShortcutPlugin />
        <EmojisPlugin />
      </div>
    </div>
  </LexicalComposer>
</template>
