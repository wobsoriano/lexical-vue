import type { LexicalEditor } from 'lexical'
import type { ComputedRef, DefineComponent, VNode } from 'vue'
import {
  computed,
  h,
  inject,
  onMounted,
  onUnmounted,
  provide,
  shallowRef,
  Teleport,
  unref,
} from 'vue'
import { decoratorHostKey } from './editorContext'

const NO_DECORATORS: ComputedRef<VNode[]> = computed(() => [])

/**
 * Node-decorator teleports for `editor`, or an empty list when an ancestor
 * already hosts them for the same editor.
 *
 * Calling this claims the host role for the calling component's subtree. Vue's
 * `inject` reads the parent's provides and never the calling component's own,
 * so a host claims for its descendants without disqualifying itself. The claim
 * holds the editor rather than a boolean so a nested editor's composer, which
 * is a descendant of the outer one, still renders its own decorators.
 */
export function useDecoratorHost(editor: LexicalEditor): ComputedRef<VNode[]> {
  const claimed = inject(decoratorHostKey, null) === editor

  provide(decoratorHostKey, editor)

  return claimed ? NO_DECORATORS : useDecorators(editor)
}

export function useDecorators(editor: LexicalEditor) {
  const decorators = shallowRef<Record<string, DefineComponent>>(editor.getDecorators())

  onMounted(() => {
    const unregister = editor.registerDecoratorListener((nextDecorators) => {
      decorators.value = nextDecorators as Record<string, DefineComponent>
    })

    // Catch any decorators that were computed between setup and onMounted.
    // ContentEditableElement.setRootElement() triggers reconciliation in its
    // own onMounted (which fires before this one), so by the time we get here
    // the decorators are already populated, we just missed the notification.
    decorators.value = editor.getDecorators() as Record<string, DefineComponent>

    onUnmounted(() => {
      unregister()
    })
  })

  // Return decorators defined as Vue Teleports
  return computed(() => {
    const decoratedTeleports = []
    const decoratorKeys = Object.keys(unref(decorators))
    for (let i = 0; i < decoratorKeys.length; i++) {
      const nodeKey = decoratorKeys[i]
      const vueDecorator = decorators.value[nodeKey]
      const element = editor.getElementByKey(nodeKey)
      if (element !== null) {
        decoratedTeleports.push(
          h(
            Teleport,
            {
              to: element,
            },
            vueDecorator,
          ),
        )
      }
    }

    return decoratedTeleports
  })
}
