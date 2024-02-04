import { createCommand } from 'lexical'
import type { LexicalCommand, LexicalEditor, LexicalNode } from 'lexical'
import { MenuOption } from '../LexicalMenu/shared'

export interface EmbedMatchResult<TEmbedMatchResult = unknown> {
  url: string
  id: string
  data?: TEmbedMatchResult
}

export interface EmbedConfig<
  TEmbedMatchResultData = unknown,
  TEmbedMatchResult = EmbedMatchResult<TEmbedMatchResultData>,
> {
  // Used to identify this config e.g. youtube, tweet, google-maps.
  type: string
  // Determine if a given URL is a match and return url data.
  parseUrl: (
    text: string,
  ) => Promise<TEmbedMatchResult | null> | TEmbedMatchResult | null
  // Create the Lexical embed node from the url data.
  insertNode: (editor: LexicalEditor, result: TEmbedMatchResult) => void
}

export const URL_MATCHER
  = /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

export const INSERT_EMBED_COMMAND: LexicalCommand<EmbedConfig['type']>
  = createCommand('INSERT_EMBED_COMMAND')

export class AutoEmbedOption extends MenuOption {
  title: string
  onSelect: (targetNode: LexicalNode | null) => void
  constructor(
    title: string,
    options: {
      onSelect: (targetNode: LexicalNode | null) => void
    },
  ) {
    super(title)
    this.title = title
    this.onSelect = options.onSelect.bind(this)
  }
}
