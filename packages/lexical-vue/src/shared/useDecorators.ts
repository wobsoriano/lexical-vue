import type { LexicalEditor } from 'lexical'
import type { DefineComponent } from 'vue'
import { computed, h, onMounted, onUnmounted, shallowRef, Teleport, unref } from 'vue'

export function useDecorators(editor: LexicalEditor) {
  const decorators = shallowRef<Record<string, DefineComponent>>(editor.getDecorators())

  onMounted(() => {
    const unregister = editor.registerDecoratorListener((nextDecorators) => {
      decorators.value = nextDecorators as Record<string, DefineComponent>
    })

    // Catch any decorators that were computed between setup and onMounted.
    // ContentEditableElement.setRootElement() triggers reconciliation in its
    // own onMounted (which fires before this one), so by the time we get here
    // the decorators are already populated — we just missed the notification.
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
