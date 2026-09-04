import type { AnyLexicalExtension, LexicalExtensionDependency } from 'lexical'
import { getExtensionDependencyFromEditor } from '@lexical/extension'
import { useLexicalComposer } from './LexicalComposer'

/**
 * Resolves the {@link LexicalExtensionDependency} for `extension` from the
 * editor provided by the nearest `LexicalComposer` or `LexicalExtensionComposer`,
 * giving access to that extension's finalized config and output.
 *
 * The editor must have been built with this exact extension reference,
 * otherwise it throws.
 */
export function useExtensionDependency<Extension extends AnyLexicalExtension>(
  extension: Extension,
): LexicalExtensionDependency<Extension> {
  return getExtensionDependencyFromEditor(useLexicalComposer(), extension)
}
