import type { AnyLexicalExtensionArgument } from 'lexical'
import type { SlotsType, VNode } from 'vue'
import type { VueRenderable } from './VueExtension'
import { buildEditorFromExtensions, getExtensionDependencyFromEditor } from '@lexical/extension'
import { defineComponent, h, isVNode, onUnmounted, provide } from 'vue'
import { VueExtension, VueProviderExtension } from './VueExtension'
import { lexicalEditorKey } from './shared/editorContext'
import { useDecoratorHost } from './shared/useDecorators'

/**
 * The extension equivalent of `LexicalComposer`. It builds an editor from the
 * given extension, provides it to the default slot, and disposes it on unmount.
 *
 * The editor is built once, on setup. A later change to `extension` is ignored,
 * because rebuilding would throw away the editor state the user has typed. Bind
 * a `:key` to whatever the extension is derived from to force a rebuild.
 */
export const LexicalExtensionComposer = defineComponent(
  (
    props: { extension: AnyLexicalExtensionArgument },
    ctx: {
      slots: {
        default?: () => any
        /** Overrides the `contentEditable` from {@link VueExtension}'s config. */
        contentEditable?: () => any
      }
    },
  ) => {
    const editor = buildEditorFromExtensions(VueProviderExtension, VueExtension, props.extension)

    provide(lexicalEditorKey, editor)

    const { contentEditable, decorators } = getExtensionDependencyFromEditor(
      editor,
      VueExtension,
    ).config
    const nodeDecorators = useDecoratorHost(editor)

    onUnmounted(() => {
      editor.dispose()
    })

    return () => [
      ctx.slots.contentEditable ? ctx.slots.contentEditable() : toVNode(contentEditable),
      ctx.slots.default?.(),
      decorators.map(toVNode),
      nodeDecorators.value,
    ]
  },
  {
    name: 'LexicalExtensionComposer',
    props: ['extension'],
    slots: Object as SlotsType<{ default?: void; contentEditable?: void }>,
  },
)

function toVNode(renderable: VueRenderable | null): VNode | null {
  if (renderable == null) {
    return null
  }

  return isVNode(renderable) ? renderable : h(renderable)
}
