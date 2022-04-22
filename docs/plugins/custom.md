# Creating decorator nodes

Decorator node is a way to embed non-text components into the editor. It can be media embeds like videos, tweets, instagram posts or more complex components with its own internal state.

Here's an example of how you can create a decorator node for embedding a video:

```vue
<script setup lang="ts">
import { computed } from 'vue'

defineProps<{
  url: string
}>()
</script>

<template>
  <iframe
    width="560"
    height="315"
    :src="url"
    frameborder="0"
    allowfullscreen="true"
    title="YouTube video"
  />
</template>
```

```tsx
// VideoNode.tsx
import type { Component } from 'vue'
import VideoPlayer from './VideoPlayer.vue'

export class VideoNode extends DecoratorNode<Component> {
  __url: string

  static getType(): string {
    return 'video'
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(node.__url, node.__key)
  }

  constructor(url: string, key?: NodeKey) {
    super(key)
    this.__url = url
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.style.display = 'contents'
    return div
  }

  updateDOM(): false {
    return false
  }

  setURL(url: string): void {
    const writable = this.getWritable()
    writable.__url = url
  }

  decorate(editor: LexicalEditor): Component {
    // Using https://github.com/vuejs/babel-plugin-jsx
    return <VideoPlayer url={this.__url} />
  }
}

export function $createVideoNode(url: string): VideoNode {
  return new VideoNode(url)
}

export function $isVideoNode(node?: LexicalNode) {
  return node instanceof VideoNode
}

type CommandPayload = string
export const INSERT_VIDEO_COMMAND: LexicalCommand<CommandPayload> = createCommand()
```

As any other custom Lexical node, decorator nodes need to be registered before they are used by passing them in the editor config. A common pattern is to register custom nodes as a part of a plugin that uses those nodes. It's also a great place to define commands that will insert those custom nodes into the editor:

```vue
<LexicalComposer :initial-config="{ ...restOfConfig, nodes: [VideoNode] }">
  ...
</LexicalComposer>
```

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useEditor } from 'lexical-vue'
import { $createVideoNode, INSERT_VIDEO_COMMAND } from './VideoNode'

const editor = useEditor()

let unregisterListener: () => void

onMounted(() => {
  // Similar with command listener, which returns unlisten callback
  unregisterListener = editor.registerCommand(
    INSERT_VIDEO_COMMAND,
    (url) => {
      // Adding custom command that will be handled by this plugin
      editor.update(() => {
        const selection = $getSelection()
        if (selection !== null) {
          const url: string = payload
          selection.insertNodes([$createVideoNode(url)])
        }
      })

      // Returning true indicates that command is handled and no further propagation is required
      return true
    },
    0
  )
})

onUnmounted(() => {
  unregisterListener?.()
})
</script>

<template />
```

Then assuming we have a some UE insert a video into the editor:

```vue
<script setup lang="ts">
import { useEditor } from 'lexical-vue'
import { INSERT_VIDEO_COMMAND } from './VideoNode'

const editor = useEditor()

const insertVideo = (url: string) => {
  editor.dispatchCommand(INSERT_VIDEO_COMMAND, url)
}
</script>

<template>
  <button @click="insertVideo('some_youtube_embed_url')">
    Add video
  </button>
</template>
```
