<script setup lang="ts">
import { $patchStyleText } from '@lexical/selection'
import type { LexicalEditor } from 'lexical'
import { $getSelection } from 'lexical'
import { ref, watch } from 'vue'

const props = defineProps<{
  selectionFontSize: string
  disabled: boolean
  editor: LexicalEditor
}>()
const MIN_ALLOWED_FONT_SIZE = 8
const MAX_ALLOWED_FONT_SIZE = 72
const DEFAULT_FONT_SIZE = 15

enum updateFontSizeType {
  increment = 1,
  decrement,
}

const inputValue = ref<string>(props.selectionFontSize)

/**
 * Calculates the new font size based on the update type.
 * @param currentFontSize - The current font size
 * @param updateType - The type of change, either increment or decrement
 * @returns the next font size
 */
function calculateNextFontSize(currentFontSize: number, updateType: updateFontSizeType | null) {
  if (!updateType)
    return currentFontSize

  let updatedFontSize: number = currentFontSize
  switch (updateType) {
    case updateFontSizeType.decrement:
      switch (true) {
        case currentFontSize > MAX_ALLOWED_FONT_SIZE:
          updatedFontSize = MAX_ALLOWED_FONT_SIZE
          break
        case currentFontSize >= 48:
          updatedFontSize -= 12
          break
        case currentFontSize >= 24:
          updatedFontSize -= 4
          break
        case currentFontSize >= 14:
          updatedFontSize -= 2
          break
        case currentFontSize >= 9:
          updatedFontSize -= 1
          break
        default:
          updatedFontSize = MIN_ALLOWED_FONT_SIZE
          break
      }
      break

    case updateFontSizeType.increment:
      switch (true) {
        case currentFontSize < MIN_ALLOWED_FONT_SIZE:
          updatedFontSize = MIN_ALLOWED_FONT_SIZE
          break
        case currentFontSize < 12:
          updatedFontSize += 1
          break
        case currentFontSize < 20:
          updatedFontSize += 2
          break
        case currentFontSize < 36:
          updatedFontSize += 4
          break
        case currentFontSize <= 60:
          updatedFontSize += 12
          break
        default:
          updatedFontSize = MAX_ALLOWED_FONT_SIZE
          break
      }
      break

    default:
      break
  }
  return updatedFontSize
}

/**
 * Patches the selection with the updated font size.
 */

function updateFontSizeInSelection(newFontSize: string | null, updateType: updateFontSizeType | null) {
  const getNextFontSize = (prevFontSize: string | null): string => {
    if (!prevFontSize)
      prevFontSize = `${DEFAULT_FONT_SIZE}px`

    prevFontSize = prevFontSize.slice(0, -2)
    const nextFontSize = calculateNextFontSize(
      Number(prevFontSize),
      updateType,
    )
    return `${nextFontSize}px`
  }

  props.editor.update(() => {
    if (props.editor.isEditable()) {
      const selection = $getSelection()
      if (selection !== null) {
        $patchStyleText(selection, {
          'font-size': newFontSize || getNextFontSize,
        })
      }
    }
  })
}

function handleKeyPress(e: KeyboardEvent) {
  const inputValueNumber = Number(inputValue.value)

  if (['e', 'E', '+', '-'].includes(e.key) || Number.isNaN(inputValueNumber)) {
    e.preventDefault()
    inputValue.value = ''
    return
  }

  if (e.key === 'Enter') {
    e.preventDefault()

    let updatedFontSize = inputValueNumber
    if (inputValueNumber > MAX_ALLOWED_FONT_SIZE)
      updatedFontSize = MAX_ALLOWED_FONT_SIZE
    else if (inputValueNumber < MIN_ALLOWED_FONT_SIZE)
      updatedFontSize = MIN_ALLOWED_FONT_SIZE

    inputValue.value = String(updatedFontSize)
    updateFontSizeInSelection(`${String(updatedFontSize)}px`, null)
  }
}

function handleButtonClick(updateType: updateFontSizeType) {
  if (inputValue.value !== '') {
    const nextFontSize = calculateNextFontSize(
      Number(inputValue.value),
      updateType,
    )
    updateFontSizeInSelection(`${String(nextFontSize)}px`, null)
  }
  else {
    updateFontSizeInSelection(null, updateType)
  }
}

watch(() => props.selectionFontSize, (newVal) => {
  inputValue.value = newVal
}, { immediate: true })
</script>

<template>
  <button
    type="button"
    class="toolbar-item font-decrement"
    :disabled="disabled || (selectionFontSize !== '' && Number(inputValue) <= MIN_ALLOWED_FONT_SIZE)"
    @click="handleButtonClick(updateFontSizeType.decrement)"
  >
    <i class="format minus-icon" />
  </button>

  <input
    v-model="inputValue"
    type="number"
    :disabled="disabled"
    class="toolbar-item font-size-input"
    :min="MIN_ALLOWED_FONT_SIZE"
    :max="MAX_ALLOWED_FONT_SIZE"
    @keydown="handleKeyPress"
  >

  <button
    type="button"
    class="toolbar-item font-decrement"
    :disabled="disabled || (selectionFontSize !== '' && Number(inputValue) >= MAX_ALLOWED_FONT_SIZE)"
    @click="handleButtonClick(updateFontSizeType.increment)"
  >
    <i class="format add-icon" />
  </button>
</template>

<style scoped>
.font-size-input {
  font-weight: bold;
  font-size: 14px;
  color: #777;
  border-radius: 5px;
  border-color: grey;
  height: 21px;
  margin-top: 5px;
  padding: 2px 4px;
  text-align: center;
  width: 20px;
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.add-icon {
  background-image: url(@/assets/images/icons/add-sign.svg);
  background-repeat: no-repeat;
  background-position: center;
}

.minus-icon {
  background-image: url(@/assets/images/icons/minus-sign.svg);
  background-repeat: no-repeat;
  background-position: center;
}

button.font-decrement {
  padding: 0px;
  margin-right: 3px;
}

button.font-increment {
  padding: 0px;
  margin-left: 3px;
}
</style>
