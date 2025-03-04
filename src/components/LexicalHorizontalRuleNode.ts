import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalCommand,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from 'lexical'

import {
  addClassNamesToElement,
  mergeRegister,
  removeClassNamesFromElement,
} from '@lexical/utils'
import {
  $applyNodeReplacement,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  DecoratorNode,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  createCommand,
} from 'lexical'
import type { Component, PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { useEffect, useLexicalComposer, useLexicalNodeSelection } from '../composables'

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

    const $onDelete = (event: KeyboardEvent) => {
      const deleteSelection = $getSelection()
      if (isSelected.value && $isNodeSelection(deleteSelection)) {
        event.preventDefault()
        deleteSelection.getNodes().forEach((node) => {
          if ($isHorizontalRuleNode(node)) {
            node.remove()
          }
        })
      }
      return false
    }

    useEffect(() => {
      return mergeRegister(
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
        editor.registerCommand(
          KEY_DELETE_COMMAND,
          $onDelete,
          COMMAND_PRIORITY_LOW,
        ),
        editor.registerCommand(
          KEY_BACKSPACE_COMMAND,
          $onDelete,
          COMMAND_PRIORITY_LOW,
        ),
      )
    })

    useEffect(() => {
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

  exportDOM(): DOMExportOutput {
    return { element: document.createElement('hr') }
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement('hr')
    addClassNamesToElement(element, config.theme.hr)
    return element
  }

  getTextContent(): string {
    return '\n'
  }

  isInline(): false {
    return false
  }

  updateDOM(): boolean {
    return false
  }

  decorate(): Component {
    return h(HorizontalRuleComponent, { nodeKey: this.__key })
  }
}

function $convertHorizontalRuleElement(): DOMConversionOutput {
  return { node: $createHorizontalRuleNode() }
}

export function $createHorizontalRuleNode(): HorizontalRuleNode {
  return $applyNodeReplacement(new HorizontalRuleNode())
}

export function $isHorizontalRuleNode(
  node: LexicalNode | null | undefined,
): node is HorizontalRuleNode {
  return node instanceof HorizontalRuleNode
}
