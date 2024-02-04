<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import TextInput from '../TextInput.vue'
import MoveWrapper from './MoveWrapper.vue'
import type { Position } from './shared'

const props = defineProps<{ color: string }>()

const emit = defineEmits<{
  (e: 'change', value: string, skipHistoryStack: boolean): void
}>()

const skipAddingToHistoryStack = ref(false)

const basicColors = [
  '#d0021b',
  '#f5a623',
  '#f8e71c',
  '#8b572a',
  '#7ed321',
  '#417505',
  '#bd10e0',
  '#9013fe',
  '#4a90e2',
  '#50e3c2',
  '#b8e986',
  '#000000',
  '#4a4a4a',
  '#9b9b9b',
  '#ffffff',
]

const WIDTH = 214
const HEIGHT = 150

const selfColor = ref(transformColor('hex', props.color))
const inputColor = ref(props.color)
const innerDivRef = ref<HTMLDivElement | null>(null)

const saturationPosition = computed(
  () => ({
    x: (selfColor.value.hsv.s / 100) * WIDTH,
    y: ((100 - selfColor.value.hsv.v) / 100) * HEIGHT,
  }),
)

const huePosition = computed(
  () => ({
    x: (selfColor.value.hsv.h / 360) * WIDTH,
  }),
)

function onSetHex(hex: string) {
  inputColor.value = hex
  if (/^#[0-9A-Fa-f]{6}$/i.test(hex)) {
    const newColor = transformColor('hex', hex)
    selfColor.value = newColor
  }
}

function onMoveSaturation({ x, y }: Position) {
  const newHsv = {
    ...selfColor.value.hsv,
    s: (x / WIDTH) * 100,
    v: 100 - (y / HEIGHT) * 100,
  }
  const newColor = transformColor('hsv', newHsv)
  selfColor.value = newColor
  inputColor.value = newColor.hex
}

function onMoveHue({ x }: Position) {
  const newHsv = { ...selfColor.value.hsv, h: (x / WIDTH) * 360 }
  const newColor = transformColor('hsv', newHsv)

  selfColor.value = newColor
  inputColor.value = newColor.hex
}

watchEffect(() => {
  // Check if the dropdown is actually active
  if (innerDivRef.value !== null) {
    emit('change', selfColor.value.hex, skipAddingToHistoryStack.value)
    inputColor.value = selfColor.value.hex
  }
})

watchEffect(() => {
  if (props.color === undefined)
    return
  const newColor = transformColor('hex', props.color)
  selfColor.value = newColor
  inputColor.value = newColor.hex
})

interface RGB {
  b: number
  g: number
  r: number
}
interface HSV {
  h: number
  s: number
  v: number
}
interface Color {
  hex: string
  hsv: HSV
  rgb: RGB
}

function toHex(value: string): string {
  if (!value.startsWith('#')) {
    const ctx = document.createElement('canvas').getContext('2d')

    if (!ctx)
      throw new Error('2d context not supported or canvas already initialized')

    ctx.fillStyle = value

    return ctx.fillStyle
  }
  else if (value.length === 4 || value.length === 5) {
    value = value
      .split('')
      .map((v, i) => (i ? v + v : '#'))
      .join('')

    return value
  }
  else if (value.length === 7 || value.length === 9) {
    return value
  }

  return '#000000'
}

function hex2rgb(hex: string): RGB {
  const rbgArr = (
    hex
      .replace(
        /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
        (m, r, g, b) => `#${r}${r}${g}${g}${b}${b}`,
      )
      .substring(1)
      .match(/.{2}/g) || []
  ).map(x => Number.parseInt(x, 16))

  return {
    b: rbgArr[2],
    g: rbgArr[1],
    r: rbgArr[0],
  }
}

function rgb2hsv({ r, g, b }: RGB): HSV {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const d = max - Math.min(r, g, b)

  const h = d
    ? (max === r
        ? (g - b) / d + (g < b ? 6 : 0)
        : max === g
          ? 2 + (b - r) / d
          : 4 + (r - g) / d) * 60
    : 0
  const s = max ? (d / max) * 100 : 0
  const v = max * 100

  return { h, s, v }
}

function hsv2rgb({ h, s, v }: HSV): RGB {
  s /= 100
  v /= 100

  const i = ~~(h / 60)
  const f = h / 60 - i
  const p = v * (1 - s)
  const q = v * (1 - s * f)
  const t = v * (1 - s * (1 - f))
  const index = i % 6

  const r = Math.round([v, q, p, p, t, v][index] * 255)
  const g = Math.round([t, v, v, q, p, p][index] * 255)
  const b = Math.round([p, p, t, v, v, q][index] * 255)

  return { b, g, r }
}

function rgb2hex({ b, g, r }: RGB): string {
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`
}

function transformColor<M extends keyof Color, C extends Color[M]>(
  format: M,
  color: C,
): Color {
  let hex: Color['hex'] = toHex('#121212')
  let rgb: Color['rgb'] = hex2rgb(hex)
  let hsv: Color['hsv'] = rgb2hsv(rgb)

  if (format === 'hex') {
    const value = color as Color['hex']

    hex = toHex(value)
    rgb = hex2rgb(hex)
    hsv = rgb2hsv(rgb)
  }
  else if (format === 'rgb') {
    const value = color as Color['rgb']

    rgb = value
    hex = rgb2hex(rgb)
    hsv = rgb2hsv(rgb)
  }
  else if (format === 'hsv') {
    const value = color as Color['hsv']

    hsv = value
    rgb = hsv2rgb(hsv)
    hex = rgb2hex(rgb)
  }

  return { hex, hsv, rgb }
}
</script>

<template>
  <div
    ref="innerDivRef"
    class="color-picker-wrapper"
    :style="`width: ${WIDTH}px`"
  >
    <TextInput label="Hex" :model-value="inputColor" @update:model-value="onSetHex" />
    <div class="color-picker-basic-color">
      <button
        v-for="basicColor in basicColors"
        :key="basicColor"
        :class="basicColor === selfColor.hex ? ' active' : ''"
        :style="{ backgroundColor: basicColor }"
        @click="inputColor = basicColor; selfColor = transformColor('hex', basicColor)"
      />
    </div>
    <MoveWrapper
      class="color-picker-saturation"
      :style="{ backgroundColor: `hsl(${selfColor.hsv.h}, 100%, 50%)` }"
      @change="onMoveSaturation"
    >
      <div
        class="color-picker-saturation_cursor"
        :style="{
          backgroundColor: selfColor.hex,
          left: `${saturationPosition.x}px`,
          top: `${saturationPosition.y}px`,
        }"
      />
    </MoveWrapper>
    <MoveWrapper
      class="color-picker-hue"
      @change="onMoveHue"
    >
      <div
        class="color-picker-hue_cursor"
        :style="{
          backgroundColor: `hsl(${selfColor.hsv.h}, 100%, 50%)`,
          left: `${huePosition.x}px`,
        }"
      />
    </MoveWrapper>
    <div
      class="color-picker-color"
      :style="{ backgroundColor: selfColor.hex }"
    />
  </div>
</template>

<style scoped>
.color-picker-wrapper {
  padding: 20px;
}

.color-picker-basic-color {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  padding: 0;
}

.color-picker-basic-color button {
  border: 1px solid #ccc;
  border-radius: 4px;
  height: 16px;
  width: 16px;
  cursor: pointer;
  list-style-type: none;
}

.color-picker-basic-color button.active {
  box-shadow: 0px 0px 2px 2px rgba(0, 0, 0, 0.3);
}

.color-picker-saturation {
  width: 100%;
  position: relative;
  margin-top: 15px;
  height: 150px;
  background-image: linear-gradient(transparent, black),
    linear-gradient(to right, white, transparent);
  user-select: none;
}
.color-picker-saturation_cursor {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 15px #00000026;
  box-sizing: border-box;
  transform: translate(-10px, -10px);
}
.color-picker-hue {
  width: 100%;
  position: relative;
  margin-top: 15px;
  height: 12px;
  background-image: linear-gradient(
    to right,
    rgb(255, 0, 0),
    rgb(255, 255, 0),
    rgb(0, 255, 0),
    rgb(0, 255, 255),
    rgb(0, 0, 255),
    rgb(255, 0, 255),
    rgb(255, 0, 0)
  );
  user-select: none;
  border-radius: 12px;
}

.color-picker-hue_cursor {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  box-shadow: #0003 0 0 0 0.5px;
  box-sizing: border-box;
  transform: translate(-10px, -4px);
}

.color-picker-color {
  border: 1px solid #ccc;
  margin-top: 15px;
  width: 100%;
  height: 20px;
}
</style>
