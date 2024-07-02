<script setup lang="ts">
import { LexicalAutoLinkPlugin } from 'lexical-vue'

const URL_MATCHER = /((https?:\/\/(www\.)?)|(www\.))[-\w@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-\w()@:%+.~#?&/=]*)/

const EMAIL_MATCHER = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])|(([a-z\-0-9]+\.)+[a-z]{2,}))/i

const MATCHERS = [
  (text: string) => {
    const match = URL_MATCHER.exec(text)
    return (
      match && {
        index: match.index,
        length: match[0].length,
        text: match[0],
        url: match[0],
      }
    )
  },
  (text: string) => {
    const match = EMAIL_MATCHER.exec(text)
    return (
      match && {
        index: match.index,
        length: match[0].length,
        text: match[0],
        url: `mailto:${match[0]}`,
      }
    )
  },
]
</script>

<template>
  <LexicalAutoLinkPlugin :matchers="MATCHERS" />
</template>
