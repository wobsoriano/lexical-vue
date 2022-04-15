<script setup lang="ts">
import { useEditor } from '../composables/useEditor'
import { useList } from '../composables/useList'

const editor = useEditor()
useList(editor)
</script>

<template />
