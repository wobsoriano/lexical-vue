import { useLexicalComposer } from 'lexical-vue'
import { $insertNodeToNearestRoot } from '@lexical/utils'
import type { LexicalCommand } from 'lexical'
import { COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical'

import { defineComponent, onMounted, onUnmounted } from 'vue'
import { $createTweetNode, TweetNode } from '../../nodes/TweetNode'

export const INSERT_TWEET_COMMAND: LexicalCommand<string> = createCommand(
  'INSERT_TWEET_COMMAND',
)

const TwitterPlugin = defineComponent(() => {
  const editor = useLexicalComposer()

  onMounted(() => {
    if (!editor.hasNodes([TweetNode]))
      throw new Error('TwitterPlugin: TweetNode not registered on editor')

    const unregister = editor.registerCommand<string>(
      INSERT_TWEET_COMMAND,
      (payload) => {
        const tweetNode = $createTweetNode(payload)
        $insertNodeToNearestRoot(tweetNode)

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

export default TwitterPlugin
