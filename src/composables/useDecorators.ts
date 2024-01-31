import type { LexicalEditor } from 'lexical'
import type { DefineComponent } from 'vue'
import { Teleport, computed, h, shallowRef, unref } from 'vue'
import { useMounted } from './useMounted'

export function useDecorators(editor: LexicalEditor) {
  const decorators = shallowRef<Record<string, DefineComponent>>(editor.getDecorators())

  useMounted(() => {
    return editor.registerDecoratorListener((nextDecorators) => {
      decorators.value = nextDecorators as Record<string, DefineComponent>
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
