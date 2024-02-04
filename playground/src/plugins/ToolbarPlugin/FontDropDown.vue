<script setup lang="ts">
import { $patchStyleText } from '@lexical/selection'
import { $getSelection, type LexicalEditor } from 'lexical'
import { dropDownActiveClass } from './shared'
import DropDown from '@/ui/DropDown.vue'
import DropDownItem from '@/ui/DropDownItem.vue'

const props = withDefaults(defineProps<{
  editor: LexicalEditor
  value: string
  customStyle: string
  disabled?: boolean
}>(), {
  disabled: false,
})

function handleClick(option: string) {
  props.editor.update(() => {
    const selection = $getSelection()
    if (selection !== null) {
      $patchStyleText(selection, {
        [props.customStyle]: option,
      })
    }
  })
}

const buttonAriaLabel = props.customStyle === 'font-family' ? 'Formatting options for font family' : 'Formatting options for font size'

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ['Arial', 'Arial'],
  ['Courier New', 'Courier New'],
  ['Georgia', 'Georgia'],
  ['Times New Roman', 'Times New Roman'],
  ['Trebuchet MS', 'Trebuchet MS'],
  ['Verdana', 'Verdana'],
]

const FONT_SIZE_OPTIONS: [string, string][] = [
  ['10px', '10px'],
  ['11px', '11px'],
  ['12px', '12px'],
  ['13px', '13px'],
  ['14px', '14px'],
  ['15px', '15px'],
  ['16px', '16px'],
  ['17px', '17px'],
  ['18px', '18px'],
  ['19px', '19px'],
  ['20px', '20px'],
]
</script>

<template>
  <DropDown
    :disabled="disabled"
    :button-class-name="`toolbar-item ${customStyle}`"
    :button-label="value"
    :button-icon-class-name="customStyle === 'font-family' ? 'icon block-type font-family' : ''"
    :button-aria-label="buttonAriaLabel"
  >
    <DropDownItem
      v-for="[option, text] in (customStyle === 'font-family' ? FONT_FAMILY_OPTIONS : FONT_SIZE_OPTIONS)"
      :key="option"
      :class="`item ${dropDownActiveClass(value === option)} ${customStyle === 'font-size' ? 'fontsize-item' : ''}`"
      @click="handleClick"
    >
      <span class="text">{{ text }}</span>
    </DropDownItem>
  </DropDown>
</template>
