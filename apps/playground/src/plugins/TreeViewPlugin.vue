<script setup lang="ts">
import { LexicalTreeView } from 'lexical-vue/LexicalTreeView'
</script>

<template>
  <LexicalTreeView
    view-class-name="tree-view-output"
    tree-type-button-class-name="debug-treetype-button"
    time-travel-panel-class-name="debug-timetravel-panel"
    time-travel-button-class-name="debug-timetravel-button"
    time-travel-panel-slider-class-name="debug-timetravel-panel-slider"
    time-travel-panel-button-class-name="debug-timetravel-panel-button"
  />
</template>
