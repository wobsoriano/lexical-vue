import type { AnyLexicalExtensionArgument } from 'lexical'
import { buildEditorFromExtensions } from '@lexical/extension'
import { defineComponent, onUnmounted, provide } from 'vue'
import { lexicalEditorKey } from './shared/editorContext'

/**
 * The extension equivalent of `LexicalComposer`. It builds an editor from the
 * given extension, provides it to the default slot, and disposes it on unmount.
 *
 * The editor is built once, on setup. A later change to `extension` is ignored,
 * because rebuilding would throw away the editor state the user has typed. Bind
 * a `:key` to whatever the extension is derived from to force a rebuild.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { RichTextExtension } from '@lexical/rich-text'
 * import { ContentEditable, LexicalExtensionComposer } from 'lexical-vue'
 * </script>
 *
 * <template>
 *   <LexicalExtensionComposer :extension="RichTextExtension">
 *     <ContentEditable />
 *   </LexicalExtensionComposer>
 * </template>
 * ```
 */
export const LexicalExtensionComposer = defineComponent(
  (props: { extension: AnyLexicalExtensionArgument }, ctx: { slots: { default?: () => any } }) => {
    const editor = buildEditorFromExtensions(props.extension)

    provide(lexicalEditorKey, editor)

    onUnmounted(() => {
      editor.dispose()
    })

    return () => ctx.slots.default?.()
  },
  {
    name: 'LexicalExtensionComposer',
    props: ['extension'],
  },
)
