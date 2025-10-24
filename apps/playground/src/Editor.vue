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
import { AutoFocusPlugin } from 'lexical-vue/LexicalAutoFocusPlugin'
import { LexicalComposer, type InitialConfigType } from 'lexical-vue/LexicalComposer'
import { ContentEditable } from 'lexical-vue/LexicalContentEditable'
import { HistoryPlugin } from 'lexical-vue/LexicalHistoryPlugin'
import AutoEmbedPlugin from './plugins/AutoEmbedPlugin/AutoEmbedPlugin.vue'

import { RichTextPlugin } from 'lexical-vue/LexicalRichTextPlugin'
import ToolbarPlugin from './plugins/ToolbarPlugin.vue'
import TreeViewPlugin from './plugins/TreeViewPlugin.vue'

import ExampleTheme from './ExampleTheme'
import { parseAllowedColor, parseAllowedFontSize } from './styleConfig'
import AutoLinkPlugin from './plugins/AutoLinkPlugin.vue'
import PlaygroundNodes from './nodes/PlaygroundNodes'
import YouTubePlugin from './plugins/YouTubePlugin'

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
  nodes: [ParagraphNode, TextNode, ...PlaygroundNodes],
  onError(error: Error) {
    throw error
  },
  theme: ExampleTheme,
} satisfies InitialConfigType
</script>

<template>
    <LexicalComposer :initial-config="editorConfig">
      <div class="editor-container">
        <ToolbarPlugin />
        <div class="editor-inner">
          <RichTextPlugin>
            <template #contentEditable>
              <ContentEditable class="editor-input" :aria-placeholder="placeholder">
                <template #placeholder>
                  <div class="editor-placeholder">{{placeholder}}</div>
                </template>
              </ContentEditable>
            </template>
          </RichTextPlugin>
          <HistoryPlugin />
          <AutoEmbedPlugin />
          <AutoLinkPlugin />
          <AutoFocusPlugin />
          <YouTubePlugin />
          <TreeViewPlugin />
        </div>
      </div>
    </LexicalComposer>
</template>
