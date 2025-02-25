<script setup lang="ts">
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical'
import type { InitialConfigType } from 'lexical-vue'
import { LexicalComposer } from 'lexical-vue'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $createListItemNode, $createListNode } from '@lexical/list'
import { $createLinkNode } from '@lexical/link'
import Editor from './Editor.vue'
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme'
import PlaygroundNodes from './nodes/PlaygroundNodes'

function prepopulatedRichText() {
  const root = $getRoot()
  if (root.getFirstChild() === null) {
    const heading = $createHeadingNode('h1')
    heading.append($createTextNode('Welcome to the playground'))
    root.append(heading)
    const quote = $createQuoteNode()
    quote.append(
      $createTextNode(
        `In case you were wondering what the black box at the bottom is – it's the debug view, showing the current state of the editor. `
        + `You can disable it by pressing on the settings control in the bottom-left of your screen and toggling the debug view setting.`,
      ),
    )
    root.append(quote)
    const paragraph = $createParagraphNode()
    paragraph.append(
      $createTextNode('The playground is a demo environment built with '),
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
      $createTextNode(`If you'd like to find out more about Lexical, you can:`),
    )
    root.append(paragraph3)
    const list = $createListNode('bullet')
    list.append(
      $createListItemNode().append(
        $createTextNode(`Visit the `),
        $createLinkNode('https://lexical.dev/').append(
          $createTextNode('Lexical website'),
        ),
        $createTextNode(` for documentation and more information.`),
      ),
      $createListItemNode().append(
        $createTextNode(`Check out the code on our `),
        $createLinkNode('https://github.com/facebook/lexical').append(
          $createTextNode('GitHub repository'),
        ),
        $createTextNode(`.`),
      ),
      $createListItemNode().append(
        $createTextNode(`Playground code can be found `),
        $createLinkNode(
          'https://github.com/facebook/lexical/tree/main/packages/lexical-playground',
        ).append($createTextNode('here')),
        $createTextNode(`.`),
      ),
      $createListItemNode().append(
        $createTextNode(`Join our `),
        $createLinkNode('https://discord.com/invite/KmG4wQnnD9').append(
          $createTextNode('Discord Server'),
        ),
        $createTextNode(` and chat with the team.`),
      ),
    )
    root.append(list)
    const paragraph4 = $createParagraphNode()
    paragraph4.append(
      $createTextNode(
        `Lastly, we're constantly adding cool new features to this playground. So make sure you check back here when you next get a chance :).`,
      ),
    )
    root.append(paragraph4)
  }
}

const initialConfig: InitialConfigType = {
  namespace: 'Playground',
  theme: PlaygroundEditorTheme,
  nodes: [
    ...PlaygroundNodes,
  ],
  editable: true,
  editorState: prepopulatedRichText as any,
  onError,
}

function onError(error: Error) {
  throw error
}
</script>

<template>
  <LexicalComposer :initial-config="initialConfig">
    <header>
      <h1>Lexical Vue Demo</h1>
    </header>
    <div class="editor-shell">
      <Editor />
    </div>
  </LexicalComposer>
  <a
    href="https://github.com/wobsoriano/lexical-vue"
    class="github-corner"
    aria-label="View source on GitHub"
  >
    <svg
      width="80"
      height="80"
      viewBox="0 0 250 250"
      style="
        border: 0;
        color: #eee;
        fill: #222;
        left: 0;
        position: absolute;
        top: 0;
        transform: scale(-1, 1);
      "
      aria-hidden="true"
    >
      <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" />
      <path
        d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
        fill="currentColor"
        :style="{ transformOrigin: '130px 106px' }"
        class="octo-arm"
      />
      <path
        d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
        fill="currentColor"
        class="octo-body"
      />
    </svg>
  </a>
</template>
