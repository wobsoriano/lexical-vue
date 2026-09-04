import type { AnyLexicalExtension, LexicalExtensionDependency } from 'lexical'
import { getExtensionDependencyFromEditor } from '@lexical/extension'
import { useLexicalComposer } from './LexicalComposer'

/**
 * Resolves the {@link LexicalExtensionDependency} for `extension` from the
 * editor provided by the nearest `LexicalComposer` or `LexicalExtensionComposer`,
 * giving access to that extension's finalized config and output.
 *
 * The editor must have been built with this extension, otherwise it throws.
 *
 * @param extension - The concrete extension reference used to build the editor
 * @returns The config and output for that extension
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { EditorStateExtension } from '@lexical/extension'
 * import { useExtensionDependency, useSignalValue } from 'lexical-vue'
 *
 * const editorState = useSignalValue(useExtensionDependency(EditorStateExtension).output)
 * </script>
 * ```
 */
export function useExtensionDependency<Extension extends AnyLexicalExtension>(
  extension: Extension,
): LexicalExtensionDependency<Extension> {
  return getExtensionDependencyFromEditor(useLexicalComposer(), extension)
}
