import type { LexicalEditor } from 'lexical'
import type { DefineComponent } from 'vue'
import { computed, h, onMounted, onUnmounted, shallowRef, Teleport, unref } from 'vue'

export function useDecorators(editor: LexicalEditor) {
  const decorators = shallowRef<Record<string, DefineComponent>>(editor.getDecorators())

  onMounted(() => {
    const unregister = editor.registerDecoratorListener((nextDecorators) => {
      decorators.value = nextDecorators as Record<string, DefineComponent>
    })

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
          h(Teleport, {
            to: element,
          }, vueDecorator),
        )
      }
    }

    return decoratedTeleports
  })
}
