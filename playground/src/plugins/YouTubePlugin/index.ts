import { useLexicalComposer } from 'lexical-vue'
import { $insertNodeToNearestRoot } from '@lexical/utils'
import type { LexicalCommand } from 'lexical'
import { COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical'

import { defineComponent, onMounted, onUnmounted } from 'vue'
import { $createYouTubeNode, YouTubeNode } from '../../nodes/YouTubeNode'

export const INSERT_YOUTUBE_COMMAND: LexicalCommand<string> = createCommand(
  'INSERT_YOUTUBE_COMMAND',
)

const YouTubePlugin = defineComponent(() => {
  const editor = useLexicalComposer()

  onMounted(() => {
    if (!editor.hasNodes([YouTubeNode]))
      throw new Error('YouTubePlugin: YouTubeNode not registered on editor')

    const unregister = editor.registerCommand<string>(
      INSERT_YOUTUBE_COMMAND,
      (payload) => {
        const youTubeNode = $createYouTubeNode(payload)
        $insertNodeToNearestRoot(youTubeNode)

        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )

    onUnmounted(() => {
      unregister()
    })
  })

  return () => null
})

export default YouTubePlugin
