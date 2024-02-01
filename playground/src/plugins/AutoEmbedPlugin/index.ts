import type { LexicalEditor } from 'lexical'
import type { EmbedConfig, EmbedMatchResult } from 'lexical-vue'
import { type Component, h } from 'vue'
import { INSERT_YOUTUBE_COMMAND } from '../YouTubePlugin'

export interface PlaygroundEmbedConfig extends EmbedConfig {
  // Human readable name of the embeded content e.g. Tweet or Google Map.
  contentName: string

  // Icon for display.
  icon?: Component

  // An example of a matching url https://twitter.com/jack/status/20
  exampleUrl: string

  // For extra searching.
  keywords: Array<string>

  // Embed a Figma Project.
  description?: string
}

export const YoutubeEmbedConfig: PlaygroundEmbedConfig = {
  contentName: 'Youtube Video',

  exampleUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',

  // Icon for display.
  icon: h('i', 'icon youtube'),

  insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
    editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, result.id)
  },

  keywords: ['youtube', 'video'],

  // Determine if a given URL is a match and return url data.
  parseUrl: async (url: string) => {
    const match
      = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/.exec(url)

    const id = match ? (match?.[2].length === 11 ? match[2] : null) : null

    if (id != null) {
      return {
        id,
        url,
      }
    }

    return null
  },

  type: 'youtube-video',
}

export const EmbedConfigs = [
  YoutubeEmbedConfig,
]

export {
  default as AutoEmbedPlugin,
} from './AutoEmbedPlugin.vue'
