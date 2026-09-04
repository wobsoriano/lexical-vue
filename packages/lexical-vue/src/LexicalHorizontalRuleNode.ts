import type { SerializedHorizontalRuleNode } from '@lexical/extension'
import type { DOMConversionOutput, NodeKey } from 'lexical'

import type { Component, PropType } from 'vue'
import {
  $isHorizontalRuleNode,
  HorizontalRuleNode as BaseHorizontalRuleNode,
  INSERT_HORIZONTAL_RULE_COMMAND,
} from '@lexical/extension'
import {
  $applyNodeReplacement,
  addClassNamesToElement,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  getComposedEventTarget,
  mergeRegister,
  removeClassNamesFromElement,
} from 'lexical'
import { defineComponent, h, watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer'
import { useLexicalNodeSelection } from './useLexicalNodeSelection'

export { $isHorizontalRuleNode, INSERT_HORIZONTAL_RULE_COMMAND, type SerializedHorizontalRuleNode }

const HorizontalRuleComponent = defineComponent({
  props: {
    nodeKey: {
      type: String as PropType<NodeKey>,
      required: true,
    },
  },
  setup(props) {
    const editor = useLexicalComposer()
    const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(() => props.nodeKey)

    watchEffect((onInvalidate) => {
      const unregister = mergeRegister(
        editor.registerCommand(
          CLICK_COMMAND,
          (event: MouseEvent) => {
            const hrElem = editor.getElementByKey(props.nodeKey)

            if (getComposedEventTarget(event) === hrElem) {
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
        } else {
          removeClassNamesFromElement(hrElem, isSelectedClassName)
        }
      }
    })

    return () => null
  },
})

export class HorizontalRuleNode extends BaseHorizontalRuleNode {
  $config() {
    return this.config('horizontalrule', {
      importDOM: {
        hr: () => ({
          conversion: $convertHorizontalRuleElement,
          priority: 0,
        }),
      },
    })
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
