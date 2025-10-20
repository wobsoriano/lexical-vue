import type { LexicalCommand } from 'lexical'
import { createCommand } from 'lexical'

export const INSERT_YOUTUBE_COMMAND: LexicalCommand<string> = createCommand(
  'INSERT_YOUTUBE_COMMAND',
)
