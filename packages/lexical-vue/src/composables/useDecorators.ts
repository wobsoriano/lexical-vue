import type { LexicalEditor } from 'lexical'
import type { Component } from 'vue'
import { Teleport, computed, h, onMounted, onUnmounted, ref } from 'vue'

export function useDecorators(editor: LexicalEditor) {
  const decorators = ref<Record<string, Component>>(editor.getDecorators())

  let unregisterListener: () => void

  onMounted(() => {
    unregisterListener = editor.registerDecoratorListener((nextDecorators) => {
      decorators.value = nextDecorators as Record<string, Component>
    })
  })

  onUnmounted(() => {
    unregisterListener?.()
  })

  // Return decorators defined as Vue Teleports
  return computed(() => {
    const decoratedTeleports = []
    const decoratorKeys = Object.keys(decorators.value)
    for (let i = 0; i < decoratorKeys.length; i++) {
      const nodeKey = decoratorKeys[i]
      const vueDecorator = decorators.value[nodeKey]
      const element = editor.getElementByKey(nodeKey)
      if (element !== null) {
        decoratedTeleports.push(
          // @ts-expect-error: Incompatible types
          h(Teleport, {
            to: element,
          }, [vueDecorator]),
        )
      }
    }

    return decoratedTeleports
  })
}
