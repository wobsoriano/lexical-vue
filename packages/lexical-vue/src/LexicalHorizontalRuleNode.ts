import type {
  DOMConversionMap,
  DOMConversionOutput,
  LexicalCommand,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from 'lexical'

import type { Component, PropType } from 'vue'
import {
  addClassNamesToElement,
  mergeRegister,
  removeClassNamesFromElement,
} from '@lexical/utils'
import {
  $applyNodeReplacement,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DecoratorNode,
} from 'lexical'
import { defineComponent, h, watchEffect } from 'vue'
import { useLexicalComposer, useLexicalNodeSelection } from './composables'

export type SerializedHorizontalRuleNode = SerializedLexicalNode

export const INSERT_HORIZONTAL_RULE_COMMAND: LexicalCommand<void>
  = createCommand('INSERT_HORIZONTAL_RULE_COMMAND')

const HorizontalRuleComponent = defineComponent({
  name: 'HorizontalRuleComponent',
  props: {
    nodeKey: {
      type: String as PropType<NodeKey>,
      required: true,
    },
  },
  setup(props) {
    const editor = useLexicalComposer()
    const { isSelected, setSelected, clearSelection }
      = useLexicalNodeSelection(() => props.nodeKey)

    watchEffect((onInvalidate) => {
      const unregister = mergeRegister(
        editor.registerCommand(
          CLICK_COMMAND,
          (event: MouseEvent) => {
            const hrElem = editor.getElementByKey(props.nodeKey)

            if (event.target === hrElem) {
              if (!event.shiftKey) {
                clearSelection()
              }
              setSelected(!isSelected.value)
              return true
            }

            return false
          },
          COMMAND_PRIORITY_LOW,
        ),
      )

      onInvalidate(unregister)
    })

    watchEffect(() => {
      const hrElem = editor.getElementByKey(props.nodeKey)
      const isSelectedClassName = editor._config.theme.hrSelected ?? 'selected'

      if (hrElem !== null) {
        if (isSelected.value) {
          addClassNamesToElement(hrElem, isSelectedClassName)
        }
        else {
          removeClassNamesFromElement(hrElem, isSelectedClassName)
        }
      }
    })
  },
})

export class HorizontalRuleNode extends DecoratorNode<Component> {
  static getType(): string {
    return 'horizontalrule'
  }

  static clone(node: HorizontalRuleNode): HorizontalRuleNode {
    return new HorizontalRuleNode(node.__key)
  }

  static importJSON(
    serializedNode: SerializedHorizontalRuleNode,
  ): HorizontalRuleNode {
    return $createHorizontalRuleNode().updateFromJSON(serializedNode)
  }

  static importDOM(): DOMConversionMap | null {
    return {
      hr: () => ({
        conversion: $convertHorizontalRuleElement,
        priority: 0,
      }),
    }
  }

  decorate(): Component {
    return h(HorizontalRuleComponent, { nodeKey: this.__key })
  }
}

function $convertHorizontalRuleElement(): DOMConversionOutput {
  return { node: $createHorizontalRuleNode() }
}

/**
 * @deprecated A pure Lexical implementation is available in `@lexical/extension` as HorizontalRuleExtension
 */
export function $createHorizontalRuleNode(): HorizontalRuleNode {
  return $applyNodeReplacement(new HorizontalRuleNode())
}

export function $isHorizontalRuleNode(
  node: LexicalNode | null | undefined,
): node is HorizontalRuleNode {
  return node instanceof HorizontalRuleNode
}
