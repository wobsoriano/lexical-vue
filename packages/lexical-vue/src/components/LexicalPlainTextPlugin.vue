<script setup lang="ts">
import { useCanShowPlaceholder } from '../composables/useCanShowPlaceholder'

const canShowPlaceholder = useCanShowPlaceholder()
</script>

<template>
  <slot name="contentEditable" />
  <slot v-if="canShowPlaceholder" name="placeholder" />
  <!-- <slot name="decorators"></slot> -->
</template>
