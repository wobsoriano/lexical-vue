<script setup lang="ts">
import type {
  DOMConversionMap,
  DOMExportOutput,
  DOMExportOutputMap,
  Klass,
  LexicalEditor,
  LexicalNode,
} from 'lexical'
import {
  $isTextNode,
  isHTMLElement,
  ParagraphNode,
  TextNode,
} from 'lexical'
import { LexicalAutoFocusPlugin } from 'lexical-vue/LexicalAutoFocusPlugin'
import { LexicalComposer } from 'lexical-vue/LexicalComposer'
import { LexicalContentEditable } from 'lexical-vue/LexicalContentEditable'
import { LexicalHistoryPlugin } from 'lexical-vue/LexicalHistoryPlugin'

import { LexicalRichTextPlugin } from 'lexical-vue/LexicalRichTextPlugin'
import ToolbarPlugin from './plugins/ToolbarPlugin.vue'
import TreeViewPlugin from './plugins/TreeViewPlugin.vue'

import ExampleTheme from './ExampleTheme'
import { parseAllowedColor, parseAllowedFontSize } from './styleConfig'

const placeholder = 'Enter some rich text...'

function removeStylesExportDOM(editor: LexicalEditor, target: LexicalNode): DOMExportOutput {
  const output = target.exportDOM(editor)
  if (output && isHTMLElement(output.element)) {
    // Remove all inline styles and classes if the element is an HTMLElement
    // Children are checked as well since TextNode can be nested
    // in i, b, and strong tags.
    for (const el of [
      output.element,
      ...output.element.querySelectorAll('[style],[class]'),
    ]) {
      el.removeAttribute('class')
      el.removeAttribute('style')
    }
  }
  return output
}

const exportMap: DOMExportOutputMap = new Map<
  Klass<LexicalNode>,
  (editor: LexicalEditor, target: LexicalNode) => DOMExportOutput
>([
  [ParagraphNode, removeStylesExportDOM],
  [TextNode, removeStylesExportDOM],
])

function getExtraStyles(element: HTMLElement): string {
  // Parse styles from pasted input, but only if they match exactly the
  // sort of styles that would be produced by exportDOM
  let extraStyles = ''
  const fontSize = parseAllowedFontSize(element.style.fontSize)
  const backgroundColor = parseAllowedColor(element.style.backgroundColor)
  const color = parseAllowedColor(element.style.color)
  if (fontSize !== '' && fontSize !== '15px') {
    extraStyles += `font-size: ${fontSize};`
  }
  if (backgroundColor !== '' && backgroundColor !== 'rgb(255, 255, 255)') {
    extraStyles += `background-color: ${backgroundColor};`
  }
  if (color !== '' && color !== 'rgb(0, 0, 0)') {
    extraStyles += `color: ${color};`
  }
  return extraStyles
}

function constructImportMap(): DOMConversionMap {
  const importMap: DOMConversionMap = {}

  // Wrap all TextNode importers with a function that also imports
  // the custom styles implemented by the playground
  for (const [tag, fn] of Object.entries(TextNode.importDOM() || {})) {
    importMap[tag] = (importNode) => {
      const importer = fn(importNode)
      if (!importer) {
        return null
      }
      return {
        ...importer,
        conversion: (element) => {
          const output = importer.conversion(element)
          if (
            output === null
            || output.forChild === undefined
            || output.after !== undefined
            || output.node !== null
          ) {
            return output
          }
          const extraStyles = getExtraStyles(element)
          if (extraStyles) {
            const { forChild } = output
            return {
              ...output,
              forChild: (child, parent) => {
                const textNode = forChild(child, parent)
                if ($isTextNode(textNode)) {
                  textNode.setStyle(textNode.getStyle() + extraStyles)
                }
                return textNode
              },
            }
          }
          return output
        },
      }
    }
  }

  return importMap
}

const editorConfig = {
  html: {
    export: exportMap,
    import: constructImportMap(),
  },
  namespace: 'React.js Demo',
  nodes: [ParagraphNode, TextNode],
  onError(error: Error) {
    throw error
  },
  theme: ExampleTheme,
}
</script>

<template>
    <LexicalComposer :initial-config="editorConfig">
      <div class="editor-container">
        <ToolbarPlugin />
        <div class="editor-inner">
          <LexicalRichTextPlugin>
            <template #contentEditable>
              <LexicalContentEditable class="editor-input" :aria-placeholder="placeholder">
                <template #placeholder>
                  <div class="editor-placeholder">{{placeholder}}</div>
                </template>
              </LexicalContentEditable>
            </template>
            <!-- <template #placeholder>
              <div class="editor-placeholder">{{placeholder}}</div>
            </template> -->
          </LexicalRichTextPlugin>
          <LexicalHistoryPlugin />
          <LexicalAutoFocusPlugin />
          <TreeViewPlugin />
        </div>
      </div>
    </LexicalComposer>
</template>
